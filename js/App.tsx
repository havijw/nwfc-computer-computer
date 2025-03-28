import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import TSVDropZone from "./components/TSVDropzone.tsx";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import { useEffect, useRef, useState } from "react";
import loadPyodideAndPackages from "./pyodide.ts";
import { PyodideInterface } from "pyodide";
import usePyodideTextFile from "./hooks/usePyodideTextFile.ts";
import AppTheme from "./theme.tsx";
import CourseAssignmentSolver, {
  CourseAssignmentFallbackComponent,
} from "./components/CourseAssignmentSolver.tsx";
import { ErrorBoundary } from "react-error-boundary";

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
  // High-level app state
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  // TODO Extract the pyodide functionality to a web worker, post messages on file uploads,
  //      and receive messages on updates to course assignments.
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

  const [studentFileInfo, studentFile, setStudentFile] = usePyodideTextFile(
    "/data/students.tsv",
    pyodide,
  );
  const [teacherFileInfo, teacherFile, setTeacherFile] = usePyodideTextFile(
    "/data/teachers.tsv",
    pyodide,
  );
  const [courseFileInfo, courseFile, setCourseFile] = usePyodideTextFile(
    "/data/courses.tsv",
    pyodide,
  );
  const [preferenceFileInfo, preferenceFile, setPreferenceFile] = usePyodideTextFile(
    "/data/preferences.tsv",
    pyodide,
  );

  return (
    <AppTheme>
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
        <ErrorBoundary FallbackComponent={CourseAssignmentFallbackComponent}>
          <CourseAssignmentSolver
            pyodide={pyodide}
            solverInputFiles={{
              students: studentFileInfo,
              teachers: teacherFileInfo,
              courses: courseFileInfo,
              preferences: preferenceFileInfo,
            }}
          />
        </ErrorBoundary>
      </Container>
      <Container component="footer" sx={{ padding: "0.5rem" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          divider={<span style={{ padding: "0 0.5rem" }}> &middot; </span>}
        >
          <Box>
            &copy;<a href="https://jackhaviland.com">Jack Haviland</a> 2025
          </Box>
          <Button
            sx={{ mx: "-6px" }}
            onClick={() => {
              setPrivacyModalOpen(true);
            }}
          >
            Privacy
          </Button>
        </Stack>
      </Container>
      {/********** Modals **********/}
      <Modal
        open={privacyModalOpen}
        onClose={() => {
          setPrivacyModalOpen(false);
        }}
        aria-labelledby="privacy-modal-title"
        aria-describedby="privacy-modal-description"
      >
        <Paper
          sx={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            p: "1rem",
          }}
        >
          <Typography variant="h6" id="privacy-modal-title">
            Privacy Policy
          </Typography>
          <Typography variant="body1" id="privacy-modal-description">
            No information is collected or stored, ever. Your files do not leave your
            computer — you can verify this by loading the page, waiting for the solver
            to load, turning off your network connection (WiFi), and checking that the
            solver still runs.
          </Typography>
        </Paper>
      </Modal>
    </AppTheme>
  );
}
