import { PyodideInterface } from "pyodide";
import { useEffect, useState } from "react";

// TODO remove this if pyodide updates the FS type
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

export default function usePyodideTextFile(
  filepath: string,
  pyodide: PyodideInterface | undefined,
): [File | undefined, React.Dispatch<React.SetStateAction<File | undefined>>] {
  const [file, setFile] = useState<File | undefined>();

  useEffect(() => {
    const pathComponents = filepath.split(/[/\\]/);
    const fileName = pathComponents.pop();
    const fileDirectory = pathComponents.join("/");
    const normalizedFilePath = [fileDirectory, fileName].join("/");

    if (pyodide) {
      const {
        parentExists,
        exists: fileExists,
        // TODO remove these disables if Pyodide updates the FS type
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
          console.log(`Removed file at ${normalizedFilePath}`);
        } else {
          // If pyodide finishes loading and `file` is not set, we need to no-op.
          console.log(`No file found at ${normalizedFilePath}, so nothing to remove.`);
        }
      }
    }
  }, [filepath, pyodide, file]);

  return [file, setFile];
}
