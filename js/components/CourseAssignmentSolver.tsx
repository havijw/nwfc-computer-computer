import { useCallback, useEffect, useMemo, useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ErrorBoundary } from "react-error-boundary";

import type { Course, SolverConfiguration, Student } from "../models";
import type { PyodideFileInfo } from "../hooks/usePyodideWorkerFile";
import pyodideWorker from "../worker/pyodideWorkerInstance";
import { type WorkerResponse } from "../worker/workerTypes";
import CourseAssignmentDisplay from "./CourseAssignmentDisplay";

/** Convert a column index to Excel-style column labels (A, B, ..., Z, AA, AB, ...). */
function getExcelColumnLabel(column: number): string {
  let label = "";
  let n = column + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    n = Math.floor((n - 1) / 26);
  }
  return label;
}

/** Create a nicely-formatted TSV file that can be imported to Excel or Google Sheets. */
function getTSVTextContent(courseAssignments: [Course, Student[]][]): string {
  const maxStudentsInCourse = Math.max(
    ...courseAssignments.map(([, students]) => students.length),
  );
  const rows = [
    courseAssignments.map(([course]) => course.title), // header
    courseAssignments.map(([course]) => course.teachers.join(", ")), // teachers
    courseAssignments.map(([course]) => `Period ${String(course.period)}`), // period
    // formula showing the number of students in each course
    courseAssignments.map((_, i) => {
      const columnLabel = getExcelColumnLabel(i);
      return `=COUNTA(${columnLabel}5:${columnLabel}${String(maxStudentsInCourse + 4)})`;
    }),
  ];
  // Each row is the names of student `i` in each course
  for (let i = 0; i < maxStudentsInCourse; i++) {
    const row = courseAssignments.map(([, students]) =>
      students[i] ? students[i].name : "",
    );
    rows.push(row);
  }
  return rows.map((row) => row.join("\t")).join("\n");
}

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
          Solving optimal course assignments failed. Changes files uploaded or settings
          to try again, or reload page.
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
            <Typography
              component="pre"
              sx={{ overflow: "scroll", fontFamily: "Monospace" }}
            >
              {error.message}
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
  // Keep track of latest solve request so stale responses can be discarded.
  const [solveRequestID, setSolveRequestID] = useState("");
  const [courseAssignments, setCourseAssignments] = useState<[Course, Student[]][]>([]);
  // Bring error handling from effect to main component for error boundary
  const [pyodideError, setPyodideError] = useState<string>();
  if (pyodideError) throw Error(pyodideError);

  // Data URI for the TSV download button
  const tsvDataURI = useMemo(() => {
    const tsvBlob = new Blob([getTSVTextContent(courseAssignments)], {
      type: "text/tab-separated-values",
    });
    return URL.createObjectURL(tsvBlob);
  }, [courseAssignments]);

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
        // Ignore stale responses
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
    // Reset course assignments so outdated assignments are not shown
    setCourseAssignments([]);
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
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center">
            <Typography variant="h5" flexGrow={1}>
              Course Assignments
            </Typography>
            <Tooltip
              title="Download TSV"
              describeChild
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [0, -9],
                      },
                    },
                  ],
                },
              }}
            >
              <Button
                aria-label="Download TSV"
                variant="outlined"
                size="small"
                href={tsvDataURI}
                download="course-assignments.tsv"
              >
                <DownloadIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Stack>
          <CourseAssignmentDisplay courseAssignments={courseAssignments} />
        </Stack>
      ) : (
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
