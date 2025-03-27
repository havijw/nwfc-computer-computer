import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import TSVDropZone from "./components/TSVDropzone.tsx";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import loadPyodideAndPackages from "./pyodide.ts";
import { PyodideInterface } from "pyodide";
import usePyodideTextFile from "./hooks/usePyodideTextFile.ts";

function FileCard(props: {
  title: string;
  file: File | undefined;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}) {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <TSVDropZone {...props} />
    </Grid>
  );
}

export default function App() {
  // TODO see if I can clean this up with React 19's new `use`
  //      https://stackoverflow.com/a/53572588
  // All this is to prevent `loadPyodide` from running multiple times, which breaks things. If we
  // don't protect it with a ref, it will be run every time the component refreshes (if not using
  // an effect) or every time the component remounts (if using an effect with an empty dependency
  // array). `React.StrictMode` demonstrates the breakage in either case.
  const [pyodide, setPyodide] = useState<PyodideInterface>();
  const loadPyodideRun = useRef(false);
  useEffect(() => {
    if (loadPyodideRun.current) return;
    loadPyodideRun.current = true;
    loadPyodideAndPackages()
      .then((value) => {
        setPyodide(value);
      })
      .catch((reason: unknown) => {
        console.log("Loading pyodide and necessary packages failed.");
        console.log(reason);
      });
  }, []);

  const [studentFile, setStudentFile] = usePyodideTextFile(
    "/data/students.tsv",
    pyodide,
  );
  const [teacherFile, setTeacherFile] = usePyodideTextFile(
    "/data/teachers.tsv",
    pyodide,
  );
  const [courseFile, setCourseFile] = usePyodideTextFile("/data/courses.tsv", pyodide);
  const [preferenceFile, setPreferenceFile] = usePyodideTextFile(
    "/data/preferences.tsv",
    pyodide,
  );

  return (
    <>
      <CssBaseline enableColorScheme />
      <Container component="header" maxWidth="lg" sx={{ paddingY: "1rem" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            component="img"
            sx={{ height: "2rem" }}
            alt="Computer-computer logo: a friendly robot"
            src="/computer-computer-icon.jpg"
          />
          <Typography variant="h5">NWFC Computer-Computer</Typography>
        </Stack>
      </Container>
      <Container
        component="main"
        fixed
        maxWidth="lg"
        sx={{
          paddingY: "1rem",
        }}
      >
        <Grid container spacing={2}>
          <FileCard title="Student List" file={studentFile} setFile={setStudentFile} />
          <FileCard title="Teacher List" file={teacherFile} setFile={setTeacherFile} />
          <FileCard title="Course List" file={courseFile} setFile={setCourseFile} />
          <FileCard
            title="Course Preferences"
            file={preferenceFile}
            setFile={setPreferenceFile}
          />
        </Grid>
      </Container>
      <Container component="footer" sx={{ textAlign: "center", padding: "0.5rem" }}>
        &copy;Jack Haviland 2025
      </Container>
    </>
  );
}
