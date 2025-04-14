import { useCallback, useEffect, useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ErrorBoundary } from "react-error-boundary";

import type { Course, SolverConfiguration, Student } from "../models";
import type { PyodideFileInfo } from "../hooks/usePyodideTextFile";
import pyodideWorker from "../worker/pyodideWorkerInstance";
import { type WorkerResponse } from "../worker/workerTypes";

/** Fallback component for error state of `CourseAssignment` component.
 *
 * @param props
 * @param props.error Error object with message to display
 */
function CourseAssignmentFallbackComponent({ error }: { error: Error }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={3}
      sx={{
        padding: "0.5rem",
        border: 1,
        borderColor: theme.palette.error.light,
      }}
    >
      <Stack>
        <Typography sx={{ textAlign: "center" }}>
          Solving optimal course assignments failed. Check settings and files uploaded,
          reload page, and try again.
        </Typography>
        <Accordion
          sx={{
            bgcolor: theme.palette.error.light,
            border: 1,
            borderColor: theme.palette.error.main,
            color: theme.palette.getContrastText(theme.palette.error.light),
          }}
        >
          <AccordionSummary
            expandIcon={
              <ExpandMoreIcon
                sx={{ color: theme.palette.getContrastText(theme.palette.error.main) }}
              />
            }
            aria-controls="error-panel-content"
            id="error-panel-header"
            sx={{
              bgcolor: theme.palette.error.main,
              color: theme.palette.getContrastText(theme.palette.error.main),
            }}
          >
            <Typography sx={{ fontWeight: "bold" }}>Full Error</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ overflow: "scroll" }}>
              <pre>{error.message}</pre>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Paper>
  );
}

/** Props for the `CourseAssignmentSolver` component. */
interface CourseAssignmentSolverProps {
  /** Information about the course data file used by the solver. */
  courseInputFile: PyodideFileInfo;

  /** Information about the student data file used by the solver. */
  studentInputFile: PyodideFileInfo;

  /** Configuration options for the solver. */
  solverConfig: SolverConfiguration;
}

/** Base component for course assignment solving with Pyodide.
 *
 * Meant to be wrapped in an error boundary.
 */
function CourseAssignmentSolverBase({
  courseInputFile,
  studentInputFile,
  solverConfig,
}: CourseAssignmentSolverProps) {
  const theme = useTheme();
  const [pyodideWorkerReady, setPyodideWorkerReady] = useState(false);
  const [solveRequestID, setSolveRequestID] = useState("");
  const [courseAssignments, setCourseAssignments] = useState<[Course, Student[]][]>([]);
  // Bring error handling from effect to main component for error boundary
  const [pyodideError, setPyodideError] = useState<string>();
  if (pyodideError) throw Error(pyodideError);

  const allFilesLoaded = courseInputFile.isLoaded && studentInputFile.isLoaded;

  const loadingMessage = !pyodideWorkerReady
    ? "Loading solver..."
    : !allFilesLoaded
      ? "Upload files to determine course assignments"
      : "Finding optimal course assignments...";
  const isWaitingOnPyodide =
    !pyodideWorkerReady || (allFilesLoaded && !courseAssignments.length);

  const handlePyodideWorkerMessage = useCallback(
    (e: MessageEvent<WorkerResponse>) => {
      if (e.data.type === "status") {
        setPyodideWorkerReady(e.data.ready);
        if (e.data.error !== null) {
          setPyodideError(e.data.error);
        }
      } else if (e.data.type === "solve" && e.data.id === solveRequestID) {
        if (e.data.error !== null) {
          setPyodideError(e.data.error);
        } else {
          setCourseAssignments(e.data.assignments);
        }
      }
    },
    [solveRequestID],
  );

  useEffect(() => {
    pyodideWorker.addEventListener("message", handlePyodideWorkerMessage);

    return () => {
      pyodideWorker.removeEventListener("message", handlePyodideWorkerMessage);
    };
  }, [handlePyodideWorkerMessage]);

  useEffect(() => {
    // Check that Pyodide worker is ready
    pyodideWorker.postMessage({ id: crypto.randomUUID(), type: "status" });
  }, []);

  useEffect(() => {
    // Rerun solver on updates to files
    if (pyodideWorkerReady && allFilesLoaded) {
      const id = crypto.randomUUID();
      setSolveRequestID(id);
      pyodideWorker.postMessage({
        id: id,
        type: "solve",
        courseInputFile: courseInputFile,
        studentInputFile: studentInputFile,
        configuration: solverConfig,
      });
    } else {
      setSolveRequestID("");
      setCourseAssignments([]);
    }
  }, [
    pyodideWorkerReady,
    allFilesLoaded,
    courseInputFile,
    studentInputFile,
    solverConfig,
  ]);

  return (
    <Paper elevation={3} sx={{ padding: "0.5rem" }}>
      {courseAssignments.length ? (
        <Grid container spacing={1}>
          {courseAssignments.map(([course, students]) => (
            <Grid size={{ xs: 6, md: 3 }} key={course.title + String(course.period)}>
              <Paper sx={{ padding: "0.5rem" }}>
                <Box sx={{ typography: "subtitle" }}>
                  P{course.period}. {course.title}
                </Box>
                <p style={{ marginTop: "0.25rem", marginBottom: "0.25rem" }}>
                  <i>{course.teachers.join(", ")}</i>
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
      ) : (
        <Box>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ color: theme.palette.text.secondary }}
          >
            {isWaitingOnPyodide && <CircularProgress size="1em" color="inherit" />}
            <Typography sx={{ textAlign: "center" }}>{loadingMessage}</Typography>
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

/** Course assignment solver component with error boundary. */
export default function CourseAssignmentSolver(props: CourseAssignmentSolverProps) {
  return (
    <ErrorBoundary
      FallbackComponent={CourseAssignmentFallbackComponent}
      resetKeys={[props]}
    >
      <CourseAssignmentSolverBase {...props} />
    </ErrorBoundary>
  );
}
