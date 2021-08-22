# Getting Started

This project was created for an exam for a company. It's a basic full stack app
which shows movies. You can filter records and import a csv file. You can also
delete all records from the database.

I use the DRY principle (don't repeat yourself)
wherever I can. That's why there's only one component: the reusable filters
at the top of the page. All you have to do is give the right props and the
correct filter appears.

I chose TailwindUI to style my components: it's a beautifully designed
component library that teaches you a lot about CSS. Since it's a low-level
utility class framework, you can tweak elements easily.

The main component (App.js) is divided into two parts: the header with stats,
buttons and filters and the actual table displaying the data. Since I'm using
the DRY principle, I didn't separate those components in 2 files. The length
of the file isn't that important for readability and maintenance.

# Limitations

- Filtering: It's impossible to filter movies with more than one criteria. It's an
  improvement I should have made but I hesitated with the features I should use:
  Context API or a basic Hook that emits events. One could have added a generic
  search bar that looks for info in all columns.
- Progress bar: I tried to turn the import button into a progress bar. I
  managed to include a percentage but wanted the button to reflect with a
  different background color the progress made. You could also add a time
  remaining indicator since it's based on the average insert time in database.
- Sorting: It would have been easy to include some sorting based on the
  columns but it wasn't asked by the requirements. By default, movies are
  sorted by rating (descending). That way you know the best movies right away.

# Available Scripts

You will need the companion backend to make this project work. In the project
directory, you can run:

## `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
