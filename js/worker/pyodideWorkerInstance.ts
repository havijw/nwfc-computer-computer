const pyodideWorker = new Worker(new URL("./pyodideWorker.ts", import.meta.url), {
  type: "module",
});
export default pyodideWorker;
