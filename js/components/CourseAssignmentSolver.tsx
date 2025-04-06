import { useEffect, useState } from "react";

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
import { PyodideInterface } from "pyodide";
import { PyProxy } from "pyodide/ffi";
import { ErrorBoundary } from "react-error-boundary";

import type { Course, SolverConfiguration, Student } from "../models";
import type { PyodideFileInfo } from "../hooks/usePyodideTextFile";

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

/** Information about data files used by the solver. */
export interface SolverInputFiles {
  /** Course data file information. */
  courses: PyodideFileInfo;

  /** Student data file information. */
  students: PyodideFileInfo;
}

/** Props for the `CourseAssignmentSolver` component. */
interface CourseAssignmentSolverProps {
  /** Pyodide instance with all necessary packages loaded.
   *
   * Should be React state and `undefined` until ready.
   */
  pyodide: PyodideInterface | undefined;

  /** Information about data files used by the solver. */
  solverInputFiles: SolverInputFiles;

  /** Configuration options for the solver. */
  solverConfig: SolverConfiguration;
}

/** Base component for course assignment solving with Pyodide.
 *
 * Meant to be wrapped in an error boundary.
 */
function CourseAssignmentSolverBase({
  pyodide,
  solverInputFiles: { students: studentFileInfo, courses: courseFileInfo },
  solverConfig,
}: CourseAssignmentSolverProps) {
  const theme = useTheme();
  const [courseAssignments, setCourseAssignments] = useState<[Course, Student[]][]>([]);
  // Bring error handling from effect to main component for error boundary
  const [pyodideError, setPyodideError] = useState<unknown>();
  if (pyodideError) throw pyodideError as Error;

  const allFilesLoaded = courseFileInfo.isLoaded && studentFileInfo.isLoaded;

  const loadingMessage = !pyodide
    ? "Loading solver..."
    : !allFilesLoaded
      ? "Upload files to determine course assignments"
      : "Finding optimal course assignments...";
  const isWaitingOnPyodide = !pyodide || (allFilesLoaded && !courseAssignments.length);

  useEffect(() => {
    // Rerun solver on updates to files
    if (pyodide && allFilesLoaded) {
      try {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, 
                          @typescript-eslint/no-unsafe-call, 
                          @typescript-eslint/no-unsafe-member-access */
        const solverEntrypoint = pyodide.pyimport("computer_computer.file_entrypoint");
        const assignmentsProxy =
          solverEntrypoint.get_optimal_course_assignments_from_files(
            courseFileInfo.path,
            studentFileInfo.path,
            solverConfig,
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
      } catch (error) {
        console.log("caught error");
        setPyodideError(error);
      }
    } else {
      setCourseAssignments([]);
    }
  }, [pyodide, allFilesLoaded, courseFileInfo, studentFileInfo, solverConfig]);

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
    <ErrorBoundary FallbackComponent={CourseAssignmentFallbackComponent}>
      <CourseAssignmentSolverBase {...props} />
    </ErrorBoundary>
  );
}
