import { loadPyodide, type PyodideInterface } from "pyodide";
import { type WorkerRequest } from "./workerTypes";
import { PyProxy } from "pyodide/ffi";
import { type Course, type Student } from "../models";

console.log("Starting pyodide web worker");

// TODO remove this type if pyodide updates the FS type
// See https://github.com/pyodide/pyodide/issues/5546
interface AnalyzePathResult {
  isRoot: boolean;
  exists: boolean;
  error: Error;
  name: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any;
  parentExists: boolean;
  parentPath: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parentObject: any;
}

let pyodide: PyodideInterface | null = null;
let loadError: unknown = null;

async function loadPyodideWithPackages() {
  const pyodide = await loadPyodide();
  const pyversion = (await pyodide.runPythonAsync(
    `import sys; sys.version.split(" ")[0]`,
  )) as string;
  console.log(`Loaded pyodide with python version ${pyversion}`);
  await pyodide.loadPackage(["numpy", "scipy"]);

  // Load computer_computer package either from files (for dev) or from built wheel (for prod)
  if (import.meta.env.DEV) {
    console.log("Loading computer_computer");
    pyodide.FS.mkdirTree("/python/computer_computer");
    // For some reason, import.meta.glob doesn't respect the project base
    const pythonModules = import.meta.glob("/python/computer_computer/*.py", {
      query: "?url",
    });
    for (const moduleURL in pythonModules) {
      // String.prototype.split() will never return an empty array
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const moduleName = moduleURL.split("/").pop()!;
      // import.meta.env.BASE_URL has a traliing "/" and moduleURL has a leading "/"
      const response = await fetch(import.meta.env.BASE_URL.slice(0, -1) + moduleURL);
      if (!response.ok) {
        throw new Error(`Failed to load computer_computer.${moduleName.slice(0, -3)}`);
      }
      const moduleCode = await response.text();
      pyodide.FS.writeFile(`/python/computer_computer/${moduleName}`, moduleCode);
    }
    await pyodide.runPythonAsync(`
      import sys
      sys.path.append("/python")
    `);
    console.log("Loaded computer_computer");
  } else {
    // TODO surely there's a better, less fragile way to do this
    const wheelName = `computer_computer-${__APP_VERSION__}-py3-none-any.whl`;
    await pyodide.loadPackage(`${import.meta.env.BASE_URL}assets/${wheelName}`);
  }
  return pyodide;
}

loadPyodideWithPackages()
  .then((pyodideWithPackages) => {
    pyodide = pyodideWithPackages;
    postMessage({ id: crypto.randomUUID(), type: "status", ready: true, error: null });
  })
  .catch((reason: unknown) => {
    loadError = reason;
    postMessage({
      id: crypto.randomUUID(),
      type: "status",
      ready: false,
      error: String(reason),
    });
  });

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  if (e.data.type === "status") {
    postMessage({
      id: e.data.id,
      type: "status",
      ready: !!pyodide,
      error: loadError === null ? loadError : String(loadError),
    });
  } else if (e.data.type === "file") {
    const file = e.data.file;
    const path = e.data.path;
    if (pyodide) {
      const parentPath = path.split("/").slice(0, -1).join("/");
      // TODO remove these disables if Pyodide updates the FS type
      // See https://github.com/pyodide/pyodide/issues/5546
      // @ts-expect-error Pyodide doesn't have the right signature for FS
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const { parentExists, exists: fileExists } = pyodide.FS.analyzePath(
        path,
      ) as AnalyzePathResult;
      if (file) {
        if (!parentExists) {
          pyodide.FS.mkdirTree(parentPath);
        }
        file
          .text()
          .then((text) => {
            if (pyodide) pyodide.FS.writeFile(path, text);
            postMessage({
              id: e.data.id,
              type: "file",
              path: path,
              loaded: true,
              error: null,
            });
          })
          .catch((reason: unknown) => {
            postMessage({
              id: e.data.id,
              type: "file",
              path: path,
              loaded: false,
              error: String(reason),
            });
          });
      } else if (fileExists) {
        pyodide.FS.unlink(path);
        postMessage({
          id: e.data.id,
          type: "file",
          path: path,
          loaded: false,
          error: null,
        });
      }
    } else {
      postMessage({
        id: e.data.id,
        type: "file",
        path: path,
        loaded: false,
        error: "Solver not yet loaded",
      });
    }
    // Explicit is good here since we might add more cases in the future.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (e.data.type === "solve") {
    if (!pyodide) {
      postMessage({
        id: e.data.id,
        type: "solve",
        assignments: null,
        error: "Solver not yet loaded",
      });
    } else {
      try {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, 
                          @typescript-eslint/no-unsafe-call, 
                          @typescript-eslint/no-unsafe-member-access */
        const solverEntrypoint = pyodide.pyimport("computer_computer.file_entrypoint");
        const assignmentsProxy =
          solverEntrypoint.get_optimal_course_assignments_from_files(
            e.data.courseInputFile.path,
            e.data.studentInputFile.path,
            e.data.configuration,
          ) as PyProxy;
        // To avoid memory leaks, don't use proxies
        // See https://pyodide.org/en/stable/usage/type-conversions.html#type-translations-pyproxy-to-js
        const assignmentsJS = assignmentsProxy.toJs({
          create_pyproxies: false,
          dict_converter: Object.fromEntries,
        }) as [Course, Student[]][];
        assignmentsJS.sort(([course1], [course2]) => {
          if (course1.period !== course2.period) return course1.period - course2.period;
          else if (course1.title.toUpperCase() < course2.title.toUpperCase()) return -1;
          else if (course1.title.toUpperCase() > course2.title.toUpperCase()) return 1;
          return 0;
        });
        postMessage({
          id: e.data.id,
          type: "solve",
          assignments: assignmentsJS,
          error: null,
        });
        assignmentsProxy.destroy();
      } catch (error) {
        postMessage({
          id: e.data.id,
          type: "solve",
          assignments: null,
          error: String(error),
        });
      }
    }
  }
};
