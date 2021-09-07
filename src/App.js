import { useEffect, useState, useCallback, React } from "react";
import { csv2json } from "./utils/csv2json";
import axios from "axios";
import Filter from "./components/Filter";
import ProgressBar from "./components/ProgressBar";
import useInfiniteScroll from "./hooks/InfiniteScroll";

function App() {
  const [movieList, setMovieList] = useState(null);
  const [displayedList, setDisplayedList] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [remaining, setRemaining] = useState(null);

  const [actor, setActor] = useState(null);
  const [director, setDirector] = useState(null);
  const [genre, setGenre] = useState(null);
  const [year, setYear] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };
  const fields = ["actors", "director", "genre", "year", "name"];

  const [isFetching, setIsFetching] = useInfiniteScroll(fetchMoreItems);
  const numItems = 50;

  function fetchMoreItems() {
    setDisplayedList((prevState) => [
      ...prevState,
      ...movieList.slice(prevState.length, prevState.length + numItems),
    ]);
    setIsFetching(false);
  }

  // const movieListFiltered = useCallback(() => {
  //   return movieList.filter((movie) => {
  //     for (const field of fields) {
  //       const value = movie[field];
  //       if (Array.isArray(value)) value = value.join();
  //       if (value?.toLowerCase().includes(searchTerm.toLowerCase()))
  //         return true;
  //     }
  //     return false;
  //   });
  // }, [movieList, searchTerm]);

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
    if (searchTerm) {
      url += actor || director || genre || year ? "&" : "?";
      url += "field=" + encodeURIComponent("search");
      url += "&" + "value=" + encodeURIComponent(searchTerm);
    }
    if (sortDir) {
      url += actor || director || genre || year || searchTerm ? "&" : "?";
      url += "field=" + encodeURIComponent("sort");
      url += "&" + "value=" + encodeURIComponent(sortDir);
    }

    refreshTable(url);
  }, [actor, director, genre, year, searchTerm, sortDir]);

  function refreshTable(url = process.env.REACT_APP_API_URL + "/movies") {
    setLoading(true);
    axios.get(url).then((data) => {
      setMovieList(data.data);
      setDisplayedList(data.data.slice(0, numItems));
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
            remaining = ((100 - percentage) * total) / percentage;
            setRemaining(percentage !== 0 ? remaining.toFixed() : "Wait");
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
                {/*<button
                  onClick={() => setSortDir("asc")}
                  className="flex items-center text-xs font-semibold text-gray-500"
                  type="button"
                  name="button"
                >
                  <svg
                    className="fill-current h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setSortDir("desc")}
                  className="flex items-center text-xs font-semibold text-gray-500"
                  type="button"
                  name="button"
                >
                  <svg
                    className="fill-current h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                    />
                  </svg>
                </button>*/}

                <div className="flex-1 min-w-0">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 text-gray-400"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      value={searchTerm}
                      onChange={handleChange}
                      type="search"
                      name="search"
                      id="search"
                      className="block w-full pl-10 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      placeholder="Search"
                    />
                  </div>
                </div>
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
                    axios
                      .delete(process.env.REACT_APP_API_URL + "/movies")
                      .then(() => refreshTable());
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
              {(loading || isFetching) && (
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
                  {displayedList &&
                    displayedList.map((movie, index) => {
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
