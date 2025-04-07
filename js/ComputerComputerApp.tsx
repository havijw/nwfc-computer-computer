import { useEffect, useRef, useState } from "react";

import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PyodideInterface } from "pyodide";

import logoURL from "/computer-computer-icon.jpg?url";
import CourseAssignmentSolver from "./components/CourseAssignmentSolver.tsx";
import TSVDropZone from "./components/TSVDropzone.tsx";
import usePyodideTextFile from "./hooks/usePyodideTextFile.ts";
import loadPyodideAndPackages from "./pyodide.ts";
import AppTheme from "./theme.tsx";
import PrivacyModal from "./modals/PrivacyModal.tsx";
import CourseFileDescriptionModal from "./modals/CourseFileDescriptionModal.tsx";
import SolverSettingsForm from "./components/SolverSettingsForm.tsx";
import StudentFileDescriptionModal from "./modals/StudentFileDescriptionModal.tsx";
import { defaultSolverConfiguration } from "./models.ts";

/** Main app component. */
export default function ComputerComputerApp() {
  // High-level app state
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [courseFileModalOpen, setCourseFileModalOpen] = useState(false);
  const [studentFileModalOpen, setStudentFileModalOpen] = useState(false);
  const [solverSettingsOpen, setSolverSettingsOpen] = useState(false);
  const [solverConfig, setSolverConfig] = useState(defaultSolverConfiguration());

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

  const [courseFileInfo, courseFile, setCourseFile] = usePyodideTextFile(
    "/data/courses.tsv",
    pyodide,
  );
  const [studentFileInfo, studentFile, setStudentFile] = usePyodideTextFile(
    "/data/students.tsv",
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
            src={logoURL}
          />
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            NWFC Computer-Computer
          </Typography>
          <IconButton
            aria-label="settings"
            onClick={() => {
              setSolverSettingsOpen(true);
            }}
          >
            <SettingsIcon />
          </IconButton>
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
          <Grid size={{ xs: 12, md: 6 }}>
            <TSVDropZone
              title="Course Data"
              file={courseFile}
              setFile={setCourseFile}
              openDescription={() => {
                setCourseFileModalOpen(true);
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TSVDropZone
              title="Student Data"
              file={studentFile}
              setFile={setStudentFile}
              openDescription={() => {
                setStudentFileModalOpen(true);
              }}
            />
          </Grid>
          <Grid size={12}>
            <CourseAssignmentSolver
              pyodide={pyodide}
              solverInputFiles={{
                courses: courseFileInfo,
                students: studentFileInfo,
              }}
              solverConfig={solverConfig}
            />
          </Grid>
        </Grid>
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

      {/********** Solver Settings Sidebar **********/}
      <Drawer
        open={solverSettingsOpen}
        onClose={() => {
          setSolverSettingsOpen(false);
        }}
        anchor="right"
      >
        <SolverSettingsForm
          config={solverConfig}
          setConfig={setSolverConfig}
          closePanel={() => {
            setSolverSettingsOpen(false);
          }}
        ></SolverSettingsForm>
      </Drawer>

      {/********** Modals **********/}
      <PrivacyModal open={privacyModalOpen} setOpen={setPrivacyModalOpen} />
      <CourseFileDescriptionModal
        open={courseFileModalOpen}
        setOpen={setCourseFileModalOpen}
      />
      <StudentFileDescriptionModal
        open={studentFileModalOpen}
        setOpen={setStudentFileModalOpen}
      />
    </AppTheme>
  );
}
