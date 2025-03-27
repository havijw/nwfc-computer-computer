import { loadPyodide } from "pyodide";

export default async function loadPyodideAndPackages() {
  console.log("Loading pyodide");
  const pyodide = await loadPyodide();
  const pyversion = (await pyodide.runPythonAsync(
    `import sys; sys.version.split(" ")[0]`,
  )) as string;
  console.log(`Loaded pyodide with python version ${pyversion}`);
  // await pyodide.loadPackage(["scipy", "pydantic"]);

  console.log("Loading computer_computer");
  // Load computer_computer package either from files (for dev) or from built wheel (for prod)
  if (import.meta.env.DEV) {
    // This is fragile but I can't think of a better way to do it
    // TODO this is not working yet!
    pyodide.FS.writeFile("/python/computer_computer/__init__.py", "");
    for (const module of ["io", "models", "solver"]) {
      const response = await fetch(`/python/computer_computer/${module}.py`);
      if (!response.ok) {
        throw new Error(`Failed to load computer_computer.${module}`);
      }
      const moduleCode = await response.text();
      pyodide.FS.writeFile(`/python/computer_computer/${module}.py`, moduleCode);
    }
    await pyodide.runPythonAsync(`
      import sys
      sys.path.append("/python")
    `);
  } else {
    await pyodide.loadPackage("/assets/computer_computer-0.1.0-py3-none-any.whl");
  }
  return pyodide;
}
