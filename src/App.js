import { useEffect, useState, useCallback, React } from "react";
import { csv2json } from "./utils/csv2json";
import axios from "axios";
import Filter from "./components/Filter";
import ProgressBar from "./components/ProgressBar";

function App() {
  const [movieList, setMovieList] = useState(null);
  let list = null;
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [remaining, setRemaining] = useState(null);

  const [actor, setActor] = useState(null);
  const [director, setDirector] = useState(null);
  const [genre, setGenre] = useState(null);
  const [year, setYear] = useState(null);

  useEffect(() => console.log(loading), [loading]);

  function forceUpdate(param) {
    switch (param?.field.prop) {
      case "actors":
        setActor(param.value);
        break;
      case "director":
        setDirector(param.value);
        break;
      case "genre":
        setGenre(param.value);
        break;
      case "year":
        setYear(param.value);
        break;
    }
  }

  useEffect(() => {
    let url = process.env.REACT_APP_API_URL + "/movies";
    if (actor) {
      url += "?field=" + encodeURIComponent("actors");
      url += "&" + "value=" + encodeURIComponent(actor);
    }
    if (director) {
      url += actor ? "&" : "?";
      url += "field=" + encodeURIComponent("director");
      url += "&" + "value=" + encodeURIComponent(director);
    }
    if (genre) {
      url += actor || director ? "&" : "?";
      url += "field=" + encodeURIComponent("genre");
      url += "&" + "value=" + encodeURIComponent(genre);
    }
    if (year) {
      url += actor || director || genre ? "&" : "?";
      url += "field=" + encodeURIComponent("year");
      url += "&" + "value=" + encodeURIComponent(year);
    }

    setLoading(true);
    axios.get(url).then((data) => {
      setMovieList(data.data);
      setLoading(false);
    });
  }, [actor, director, genre, year]);

  function refreshTable() {
    let url = process.env.REACT_APP_API_URL + "/movies";
    setLoading(true);
    axios.get(url).then((data) => {
      setMovieList(data.data);
      setLoading(false);
    });
  }

  useEffect(() => {
    refreshTable();
  }, []);

  function handleImport() {
    var input = document.getElementById("upload");
    var reader = new FileReader();
    let movies = null;

    reader.onload = async function (e) {
      let numImported = 0;
      setProgress(0);
      setUploading(true);
      var start = 0,
        end = 0,
        elapsed = 0,
        total = 0,
        average = 0,
        remaining = 0,
        percentage,
        rerenderTime = 0;

      const csvFile = reader.result;
      movies = JSON.parse(csv2json(csvFile));
      // await Promise.all(
      //   movies.map(async (movie, index) => {
      for (const movie of movies) {
        try {
          if (movie.Name !== "") {
            start = Date.now();
            await axios.post(process.env.REACT_APP_API_URL + "/movies", {
              movie,
            });

            numImported++;
            percentage = (numImported / movies.length) * 100;
            end = Date.now();
            elapsed = (end - start) / 1000; // secs
            total += elapsed + rerenderTime;

            start = Date.now();
            setProgress(percentage.toFixed());
            setRemaining((((100 - percentage) * total) / percentage).toFixed());
            end = Date.now();
            rerenderTime = (end - start) / 1000; // secs
          }
        } catch (e) {
          console.log("error", e.message);
        }
      }

      setUploading(false);
      refreshTable();
      // setTimeout(() => setUploading(false), 1000);
    };
    reader.readAsText(input.files[0]);
  }

  const sortByName = (a, b) => {
    var nameA = a.toUpperCase();
    var nameB = b.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  };

  return (
    <div className="App mx-auto px-6 py-7">
      <header className="">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Movie Finder
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              {movieList && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  {/* Heroicon name: solid/briefcase */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  {movieList.length} movies
                </div>
              )}
            </div>
          </div>
          <div className="mt-5 flex  lg:mt-0 lg:ml-4 ">
            {movieList && (
              <div className="flex space-x-1">
                <Filter
                  update={forceUpdate}
                  field={{ col: "Actor", prop: "actors" }}
                  values={[
                    ...new Set(
                      movieList
                        .map((movie) => {
                          return movie.actors
                            .split(",")
                            .map((actor) => actor.trim());
                        })
                        .flat()
                    ),
                  ].sort(sortByName)}
                />
                <Filter
                  update={forceUpdate}
                  field={{ col: "Director", prop: "director" }}
                  values={[
                    ...new Set(
                      movieList.map((movie) => {
                        return movie.director.trim();
                      })
                    ),
                  ].sort(sortByName)}
                />
                <Filter
                  update={forceUpdate}
                  field={{ col: "Genre", prop: "genre" }}
                  values={[
                    ...new Set(
                      movieList
                        .map((movie) => {
                          return movie.genre.split(",").map((g) => g.trim());
                        })
                        .flat()
                    ),
                  ].sort(sortByName)}
                />
                <Filter
                  update={forceUpdate}
                  field={{ col: "Release", prop: "year" }}
                  values={[
                    ...new Set(
                      movieList.map((movie) => {
                        return Number(movie.year);
                      })
                    ),
                  ].sort((a, b) => a - b)}
                />
              </div>
            )}
            <div className="ml-3 space-x-1">
              <span>
                <label
                  className={` ${
                    uploading && "w-32"
                  } relative overflow-hidden cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700`}
                >
                  {/*}{uploading && (
                    <ProgressBar progress={progress} remaining={remaining} />
                  )}*/}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-1 mr-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    type="file"
                    id="upload"
                    accept=".csv"
                    className="hidden"
                    onChange={() => handleImport()}
                  />
                  {!uploading ? (
                    <span>Import</span>
                  ) : (
                    <>
                      <span className="mx-auto">
                        {remaining > 60
                          ? Math.floor(remaining / 60) +
                            "m " +
                            Math.floor(remaining % 60) +
                            "s"
                          : remaining + "s"}
                      </span>
                      <div
                        className="h-full absolute inset-0 bg-indigo-900 opacity-50"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </>
                  )}
                </label>
              </span>
              <span>
                <button
                  onClick={async () => {
                    setLoading(true);
                    axios
                      .delete(process.env.REACT_APP_API_URL + "/movies")
                      .then(() => refreshTable());
                    setLoading(false);
                  }}
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col mt-4">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {loading && (
                <div className="flex justify-center items-center absolute inset-0">
                  <svg
                    className="h-48 animate-spin-slow mr-2 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Name",
                      "Director",
                      "Genre",
                      "Release Date",
                      "Rating",
                      "Votes",
                      "Revenue",
                    ].map((column, index) => {
                      return (
                        <th
                          key={index}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movieList &&
                    movieList.map((movie, index) => {
                      return (
                        <tr key={index}>
                          {[
                            "name",
                            "director",
                            "genre",
                            "year",
                            "rating",
                            "votes",
                            "revenue",
                          ].map((field, index) => {
                            let value = movie[field];
                            if (field === "rating") value = value.toFixed(1);
                            if (field === "revenue") value = value.toFixed(2);
                            return (
                              <td
                                key={index}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                              >
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
