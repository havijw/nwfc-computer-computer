import { loadPyodide } from "pyodide";

export default async function loadPyodideAndPackages() {
  console.log("Loading pyodide");
  const pyodide = await loadPyodide();
  const pyversion = (await pyodide.runPythonAsync(
    `import sys; sys.version.split(" ")[0]`,
  )) as string;
  console.log(`Loaded pyodide with python version ${pyversion}`);
  await pyodide.loadPackage("scipy");
  return pyodide;
}
