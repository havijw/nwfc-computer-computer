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

/** React hook to synchronize a state file object with a location in Pyodide's file system.
 *
 * Changes to the state file object are reflected in Pyodide's file system, but not vice-versa.
 *
 * @param filepath The path where the file should be loaded in Pyodide's file system.
 *
 * @returns Array with three objects:
 *   - `PyodideFileInfo`: Information about the file in Pyodide's file system.
 *   - `File`: State whose changes will be reflected in Pyodide's file system.
 *   - `(file: File) => void`: Function to update the state `File` object.
 */
export default function usePyodideTextFile(
  filepath: string,
): [
  PyodideFileInfo,
  File | undefined,
  React.Dispatch<React.SetStateAction<File | undefined>>,
] {
  const [file, setFile] = useState<File | undefined>();
  const [isFileLoaded, setIsFileLoaded] = useState(false);
  const [isPyodideLoaded, setIsPyodideLoaded] = useState(false);

  const handlePyodideWorkerMessage = useCallback(
    (e: MessageEvent<WorkerResponse>) => {
      if (e.data.type === "status") {
        setIsPyodideLoaded(e.data.ready);
      } else if (e.data.type === "file" && e.data.path == filepath) {
        setIsFileLoaded(e.data.loaded);
      }
    },
    [filepath],
  );

  useEffect(() => {
    pyodideWorker.addEventListener("message", handlePyodideWorkerMessage);

    return () => {
      pyodideWorker.removeEventListener("message", handlePyodideWorkerMessage);
    };
  }, [handlePyodideWorkerMessage]);

  useEffect(() => {
    if (isPyodideLoaded) {
      pyodideWorker.postMessage({
        id: crypto.randomUUID(),
        type: "file",
        file: file,
        path: filepath,
      });
    }
  }, [isPyodideLoaded, file, filepath]);

  const fileInfo = useMemo<PyodideFileInfo>(
    () => ({ path: filepath, isLoaded: isFileLoaded }),
    [filepath, isFileLoaded],
  );

  return [fileInfo, file, setFile];
}
