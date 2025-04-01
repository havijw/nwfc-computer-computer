import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { Course, SolverInputFiles, Student } from "../models";
import { PyodideInterface } from "pyodide";
import { useEffect, useState } from "react";
import { PyProxy } from "pyodide/ffi";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Accordion, AccordionDetails, AccordionSummary, Stack } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export function CourseAssignmentFallbackComponent({ error }: { error: Error }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={3}
      sx={{
        marginTop: "1rem",
        padding: "0.5rem",
        border: 1,
        borderColor: theme.palette.error.light,
      }}
    >
      <Stack>
        <Typography sx={{ textAlign: "center" }}>
          Solving optimal course assignments failed. Check files uploaded, reload page,
          and try again.
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
            <Typography>
              <pre>{error.message}</pre>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Paper>
  );
}

export default function CourseAssignmentSolver({
  pyodide,
  solverInputFiles: { students: studentFileInfo, courses: courseFileInfo },
}: {
  pyodide: PyodideInterface | undefined;
  solverInputFiles: SolverInputFiles;
}) {
  const theme = useTheme();
  const [courseAssignments, setCourseAssignments] = useState<[Course, Student[]][]>([]);
  // Bring error handling from effect to main component
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
  }, [pyodide, allFilesLoaded, courseFileInfo, studentFileInfo]);

  return (
    <Paper elevation={3} sx={{ marginTop: "1rem", padding: "0.5rem" }}>
      {courseAssignments.length ? (
        <Grid container spacing={1}>
          {courseAssignments.map(([course, students]) => (
            <Grid size={3} key={course.title + String(course.period)}>
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
