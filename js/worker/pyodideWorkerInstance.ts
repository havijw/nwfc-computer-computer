import { type WorkerResponse } from "./workerTypes";

const pyodideWorker = new Worker(new URL("./pyodideWorker.ts", import.meta.url), {
  type: "module",
});

if (import.meta.env.DEV) {
  // In dev, log all messages sent by worker
  const logWorkerSentMessage = (e: MessageEvent<WorkerResponse>) => {
    console.log(">>> Worker sent:", e.data);
  };
  pyodideWorker.addEventListener("message", logWorkerSentMessage);
}

export default pyodideWorker;
