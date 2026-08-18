import { loadPyodide, type PyodideInterface } from "pyodide";
import {
  type WorkerRequest,
  type WorkerResponse,
  type WorkerFileResponse,
} from "./workerTypes";
import { PyProxy } from "pyodide/ffi";
import { type Course, type Student } from "../models";

console.log("Starting pyodide web worker");

/** Global Pyodide instance. Used to determine whether the worker is "ready" for status
 * responses, so should only be assigned once Pyodide and all dependencies are loaded.
 */
let pyodide: PyodideInterface | null = null;
/** Error due to loading Pyodide. */
let loadError: string | null = null;

/** Type-safe wrapper around `postMessage`. */
function postResponse(response: WorkerResponse): void {
  postMessage(response);
}

/** Load Pyodide instance and all package dependencies.
 *
 * Calls `loadPyodide`, so should only be called once!
 *
 * @returns Promise that resolves to a Pyodide instance ready for the solver to be
 * imported and called.
 */
async function loadPyodideWithPackages(): Promise<PyodideInterface> {
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

// Load Pyodide instance into global state and post message when ready.
loadPyodideWithPackages()
  .then((pyodideWithPackages) => {
    pyodide = pyodideWithPackages;
    postResponse({
      id: crypto.randomUUID(),
      type: "status",
      ready: true,
      error: null,
    });
  })
  .catch((reason: unknown) => {
    loadError = String(reason);
    postResponse({
      id: crypto.randomUUID(),
      type: "status",
      ready: false,
      error: loadError,
    });
  });

/** Worker message handler. Refer to the `WorkerRequest` type for expected messages. */
self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  if (import.meta.env.DEV) {
    // In dev, log all messages sent to worker
    console.log("<<< Worker recv:", e.data);
  }

  /********** Status Request **********/
  if (e.data.type === "status") {
    if (pyodide) {
      postResponse({ id: e.data.id, type: "status", ready: true, error: null });
    } else {
      postResponse({ id: e.data.id, type: "status", ready: false, error: loadError });
    }

    /********** File Request **********/
  } else if (e.data.type === "file") {
    const file = e.data.file;
    const path = e.data.path;
    const response: WorkerFileResponse = {
      id: e.data.id,
      type: "file",
      path: path,
      loaded: false,
      error: null,
    };
    if (pyodide) {
      const parentPath = path.split("/").slice(0, -1).join("/");
      const { parentExists, exists: fileExists } = pyodide.FS.analyzePath(path);
      if (file) {
        try {
          if (!parentExists) {
            pyodide.FS.mkdirTree(parentPath);
          }
          const fileText = await file.text();
          pyodide.FS.writeFile(path, fileText);
          response.loaded = true;
        } catch (reason: unknown) {
          response.error = String(reason);
        }
      } else if (fileExists) {
        try {
          pyodide.FS.unlink(path);
          response.loaded = false;
        } catch (reason: unknown) {
          response.error = String(reason);
        }
      }
    } else {
      response.error = "Solver not yet loaded";
    }
    postResponse(response);

    /********** Solve Request **********/
    // Explicit is good here since we might add more cases in the future.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (e.data.type === "solve") {
    // Making a response with default values and then assigning them as we go doesn't
    // work well here because the type system prevents us from making a solve response
    // that has `assignments` and `error` null. It's easier to just post messages
    // where appropriate. But make sure they're typed!
    if (!pyodide) {
      postResponse({
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
        postResponse({
          id: e.data.id,
          type: "solve",
          assignments: assignmentsJS,
          error: null,
        });
        assignmentsProxy.destroy();
      } catch (error) {
        postResponse({
          id: e.data.id,
          type: "solve",
          assignments: null,
          error: String(error),
        });
      }
    }
  }
};
