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
import { Course, Student } from "./models.ts";
import { PyProxy } from "pyodide/ffi";
import AppTheme from "./theme.tsx";

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

  const [studentFilePath, studentFile, setStudentFile, isStudentFileLoaded] =
    usePyodideTextFile("/data/students.tsv", pyodide);
  const [teacherFilePath, teacherFile, setTeacherFile, isTeacherFileLoaded] =
    usePyodideTextFile("/data/teachers.tsv", pyodide);
  const [courseFilePath, courseFile, setCourseFile, isCourseFileLoaded] =
    usePyodideTextFile("/data/courses.tsv", pyodide);
  const [
    preferenceFilePath,
    preferenceFile,
    setPreferenceFile,
    isPreferenceFileLoaded,
  ] = usePyodideTextFile("/data/preferences.tsv", pyodide);

  const [courseAssignments, setCourseAssignments] = useState<[Course, Student[]][]>([]);

  useEffect(() => {
    // Rerun optimization on updates to files
    if (
      pyodide &&
      [
        isStudentFileLoaded,
        isTeacherFileLoaded,
        isCourseFileLoaded,
        isPreferenceFileLoaded,
      ].every(Boolean)
    ) {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, 
                        @typescript-eslint/no-unsafe-call, 
                        @typescript-eslint/no-unsafe-member-access */
      const solverEntrypoint = pyodide.pyimport("computer_computer.file_entrypoint");
      const assignmentsProxy =
        solverEntrypoint.get_optimal_course_assignments_from_files(
          studentFilePath,
          teacherFilePath,
          courseFilePath,
          preferenceFilePath,
        ) as PyProxy;

      // To avoid memory leaks, don't use proxies
      // See https://pyodide.org/en/stable/usage/type-conversions.html#type-translations-pyproxy-to-js
      const assignmentsJS = assignmentsProxy.toJs({
        create_pyproxies: false,
        dict_converter: Object.fromEntries,
      }) as [Course, Student[]][];
      assignmentsJS.sort(([course1], [course2]) => {
        if (course1.period !== course2.period) return course1.period - course2.period;
        else if (course1.title.toUpperCase() < course2.title.toUpperCase()) return -1;
        else if (course1.title.toUpperCase() > course2.title.toUpperCase()) return 1;
        return 0;
      });

      setCourseAssignments(assignmentsJS);
      assignmentsProxy.destroy();
    } else {
      setCourseAssignments([]);
    }
  }, [
    pyodide,
    studentFilePath,
    teacherFilePath,
    courseFilePath,
    preferenceFilePath,
    isStudentFileLoaded,
    isTeacherFileLoaded,
    isCourseFileLoaded,
    isPreferenceFileLoaded,
  ]);

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
        <Paper elevation={3} sx={{ marginTop: "1rem", padding: "0.5rem" }}>
          {!pyodide ? (
            <p style={{ textAlign: "center", color: "gray" }}>Pyodide loading...</p>
          ) : !courseAssignments.length ? (
            <p style={{ textAlign: "center", color: "gray" }}>
              Upload files to run solver
            </p>
          ) : (
            <Grid container spacing={1}>
              {courseAssignments.map(([course, students]) => (
                <Grid size={3} key={course.title + String(course.period)}>
                  <Paper sx={{ padding: "0.5rem" }}>
                    <Box sx={{ typography: "subtitle" }}>
                      P{course.period}. {course.title}
                    </Box>
                    <p style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>
                      <i>{course.teachers.map((teacher) => teacher.name).join(", ")}</i>
                      <br />
                      {students.length} students:
                    </p>
                    <ul style={{ marginTop: 0 }}>
                      {students.map((student) => (
                        <li key={student.name}>{student.name}</li>
                      ))}
                    </ul>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
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
