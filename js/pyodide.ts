import { loadPyodide } from "pyodide";

/** Asynchronously loads Pyodide and all required packages.
 *
 * @returns The loaded Pyodide instance with all required packages.
 */
export default async function loadPyodideAndPackages() {
  console.log("Loading pyodide");
  const pyodide = await loadPyodide();
  const pyversion = (await pyodide.runPythonAsync(
    `import sys; sys.version.split(" ")[0]`,
  )) as string;
  console.log(`Loaded pyodide with python version ${pyversion}`);
  await pyodide.loadPackage(["numpy", "scipy"]);

  console.log("Loading computer_computer");
  // Load computer_computer package either from files (for dev) or from built wheel (for prod)
  if (import.meta.env.DEV) {
    pyodide.FS.mkdirTree("/python/computer_computer/");
    // For some reason, import.meta.glob doesn't respect the project base
    const pythonModules = import.meta.glob("/python/computer_computer/*.py", {
      query: "?url",
    });
    for (const moduleURL in pythonModules) {
      // String.prototype.split() will never return an empty array
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const moduleName = moduleURL.split("/").pop()!;
      // import.meta.env.BASE_URL has a trailing "/" and moduleURL has a leading "/"
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
  } else {
    // TODO surely there's a better, less fragile way to do this
    const wheelName = `computer_computer-${__APP_VERSION__}-py3-none-any.whl`;
    await pyodide.loadPackage(`${import.meta.env.BASE_URL}assets/${wheelName}`);
  }
  console.log("Loaded computer_computer");
  return pyodide;
}
