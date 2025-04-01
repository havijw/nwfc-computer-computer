import { PyodideInterface } from "pyodide";
import { useEffect, useState } from "react";

/** Information about a Pyodide file controlled by the `usePyodideTextFile` hook.  */
export interface PyodideFileInfo {
  /** Path to the file in Pyodide's file system. */
  path: string;

  /** Whether the file is currently loaded in Pyodide's file system. */
  isLoaded: boolean;
}

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

/** React hook to synchronize a state file object with a location in Pyodide's file system.
 *
 * Changes to the state file object are reflected in Pyodide's file system, but not vice-versa.
 *
 * @param filepath The path where the file should be loaded in Pyodide's file system.
 * @param pyodide The Pyodide instance with the file system where the file should be loaded.
 *
 * @returns Array with three objects:
 *   - `PyodideFileInfo`: Information about the file in Pyodide's file system.
 *   - `File`: State whose changes will be reflected in Pyodide's file system.
 *   - `(file: File) => void`: Function to update the state `File` object.
 */
export default function usePyodideTextFile(
  filepath: string,
  pyodide: PyodideInterface | undefined,
): [
  PyodideFileInfo,
  File | undefined,
  React.Dispatch<React.SetStateAction<File | undefined>>,
] {
  // Break down and normalize file path to ensure it uses "/" as a separator
  const pathComponents = filepath.split(/[/\\]/); // Guaranteed to have at least one item to pop
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const fileName = pathComponents.pop()!;
  const fileDirectory = pathComponents.join("/");
  const normalizedFilePath = [fileDirectory, fileName].join("/");

  const [file, setFile] = useState<File | undefined>();
  const [isFileLoaded, setIsFileLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (pyodide) {
      const {
        parentExists,
        exists: fileExists,
        // TODO remove these disables if Pyodide updates the FS type
        // See https://github.com/pyodide/pyodide/issues/5546
        // @ts-expect-error Pyodide doesn't have the right signature for FS
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      } = pyodide.FS.analyzePath(normalizedFilePath) as AnalyzePathResult;
      if (!parentExists) {
        pyodide.FS.mkdirTree(fileDirectory);
      }

      if (file) {
        file
          .text()
          .then((text) => {
            pyodide.FS.writeFile(normalizedFilePath, text);
            setIsFileLoaded(true);
          })
          .catch((reason: unknown) => {
            throw new Error(
              `Reading file contents as text for path ${normalizedFilePath} failed.\n` +
                String(reason),
            );
          });
        console.log(`Loaded file to ${normalizedFilePath}`);
      } else {
        if (fileExists) {
          pyodide.FS.unlink(normalizedFilePath);
          setIsFileLoaded(false);
          console.log(`Removed file at ${normalizedFilePath}`);
        } else {
          // If pyodide finishes loading and `file` is not set, we need to no-op.
          console.log(`No file found at ${normalizedFilePath}, so nothing to remove.`);
        }
      }
    }
  }, [pyodide, file, fileDirectory, normalizedFilePath]);

  return [{ path: normalizedFilePath, isLoaded: isFileLoaded }, file, setFile];
}
