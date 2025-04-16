import { useCallback, useEffect, useMemo, useState } from "react";
import pyodideWorker from "../worker/pyodideWorkerInstance";
import { WorkerResponse } from "../worker/workerTypes";

/** Information about a Pyodide file controlled by the `usePyodideTextFile` hook.  */
export interface PyodideFileInfo {
  /** Path to the file in Pyodide's file system. */
  path: string;

  /** Whether the file is currently loaded in Pyodide's file system. */
  isLoaded: boolean;
}

/** React hook to synchronize a state file object with a location in Pyodide's file
 * system through the Pyodide worker.
 *
 * Changes to the state file object are reflected in Pyodide's file system, but not vice-versa.
 *
 * @param path The path where the file should be loaded in Pyodide's file system.
 *
 * @returns Array with three objects:
 *   - `PyodideFileInfo`: Information about the file in Pyodide's file system.
 *   - `File`: State whose changes will be reflected in Pyodide's file system.
 *   - `(file: File) => void`: Function to update the state `File` object.
 */
export default function usePyodideWorkerFile(
  path: string,
): [
  PyodideFileInfo,
  File | undefined,
  React.Dispatch<React.SetStateAction<File | undefined>>,
] {
  const [file, setFile] = useState<File | undefined>();
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [isPyodideLoaded, setIsPyodideLoaded] = useState(false);

  // Keep track of whether Pyodide is loaded to know whether it is possible to send
  // changes to the worker.
  const handlePyodideWorkerMessage = useCallback(
    (e: MessageEvent<WorkerResponse>) => {
      if (e.data.type === "status") {
        setIsPyodideLoaded(e.data.ready);
      } else if (e.data.type === "file" && e.data.path == path) {
        setIsFileLoaded(e.data.loaded);
      }
    },
    [path],
  );

  useEffect(() => {
    pyodideWorker.addEventListener("message", handlePyodideWorkerMessage);

    return () => {
      pyodideWorker.removeEventListener("message", handlePyodideWorkerMessage);
    };
  }, [handlePyodideWorkerMessage]);

  // Update the worker on changes as long as Pyodide is loaded.
  useEffect(() => {
    if (isPyodideLoaded) {
      pyodideWorker.postMessage({
        id: crypto.randomUUID(),
        type: "file",
        file: file,
        path: path,
      });
    }
  }, [isPyodideLoaded, file, path]);

  const fileInfo = useMemo<PyodideFileInfo>(
    () => ({ path: path, isLoaded: isFileLoaded }),
    [path, isFileLoaded],
  );

  return [fileInfo, file, setFile];
}
