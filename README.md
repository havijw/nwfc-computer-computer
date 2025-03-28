# Computer Computer

A solver for the "human computer" problem of assigning students to classes at Next Wave/Full Circle High School in Somerville, MA. The problem can be modeled as a mixed integer linear programming problem. This logic is implemented in the Python package [computer_computer](/python/) and the rest of the project creates an interface around that logic using React and Pyodide.

## Getting Started

The solver is run as a web app using [React](https://react.dev/) and [Material UI](https://mui.com/material-ui/) for the interface and running Python via [Pyodide](https://pyodide.org/) for the solver logic. The project is set up for [npm](https://www.npmjs.com/) and [Vite](https://vite.dev/) as front-end tooling and [uv](https://docs.astral.sh/uv/) for Python tooling.

### Web app development

Install [Node](https://nodejs.org/en/download) on your system, which includes the npm package manager, and install the dependencies for this project:

```shell
npm install
```

There are additional Python package dependencies needed for the solver to run in the web app that the Pyodide npm package does not include. There is a script to install them:

```shell
./install_pyodide_packages.sh
```

Start a dev server that will automatically reflect changes in source code (including Python files in [python/](/python/)!):

```shell
npm run dev
```

Open <http://localhost:5173> in your browser to view the app.

Once you've made some changes, run the autoformatter and linter via npm:

```shell
npm run format
npm run lint
```

Test that the app builds for production and preview the production build (you will also need [uv](https://docs.astral.sh/uv/getting-started/installation/) installed to build the Python part of the project):

```shell
npm run build
npm run preview
```

Open <http://localhost:4173> to view the build preview.

### Python development

Install [uv](https://docs.astral.sh/uv/getting-started/installation/), navigate to the [python/](/python/) directory, and install the project in dev mode:

```shell
cd python/
uv sync --extra dev
```

The rest of this section assumes you are in the [python/](/python/) directory, not the project root.

Run the test suite using [pytest](https://docs.pytest.org/):

```shell
uv run pytest
```

Once you've made some changes, run the autoformatter and linter (using [Ruff](https://docs.astral.sh/ruff/) for both):

```shell
uv run ruff format .
uv run ruff check .
```
