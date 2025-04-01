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
import logoURL from "/computer-computer-icon.jpg?url";
import FileDescriptionModal from "./components/FileDescriptionModal.tsx";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import { styled, Theme } from "@mui/material/styles";

// Table component with dividers between all cells and rounded corners
const SpreadSheetTable = styled(Table)(({ theme }: { theme: Theme }) => ({
  borderCollapse: "separate",
  border: "1px solid",
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  "& th": {
    borderLeft: "1px solid",
    borderColor: theme.palette.divider,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[200],
  },
  "& td": {
    borderLeft: "1px solid",
    borderColor: theme.palette.divider,
  },
  "& tr:last-of-type td": {
    borderBottom: "none",
  },
  "& td:first-of-type, th:first-of-type": {
    borderLeft: "none",
  },
}));

export default function App() {
  // High-level app state
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [courseFileModalOpen, setCourseFileModalOpen] = useState(false);
  const [studentFileModalOpen, setStudentFileModalOpen] = useState(false);

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
        </Grid>
        <ErrorBoundary FallbackComponent={CourseAssignmentFallbackComponent}>
          <CourseAssignmentSolver
            pyodide={pyodide}
            solverInputFiles={{
              courses: courseFileInfo,
              students: studentFileInfo,
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

      {/**********************************************************************/}
      {/******************************* Modals *******************************/}
      {/**********************************************************************/}
      {/* Privacy policy */}
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

      {/* Course data file description */}
      <FileDescriptionModal
        open={courseFileModalOpen}
        onClose={() => {
          setCourseFileModalOpen(false);
        }}
        title="Course data file"
      >
        <Typography variant="body1">
          Course data is uploaded in a spreadsheet in TSV format with the columns shown
          below. The column titles dont&apos;t need to tbe the same, but the order of
          the columns should match the example.
        </Typography>
        <ul style={{ marginTop: "0.5rem" }}>
          <li>
            Subject areas and teacher names should be in a single cell for each course,
            separated by commas.
          </li>
          <li>
            Subject areas are case-insensitive and are matched with student subject
            requirements from the student data file.
          </li>
        </ul>
        <TableContainer>
          <SpreadSheetTable aria-label="teacher-file-spreadsheet-format">
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Subject Area(s)</TableCell>
                <TableCell>Teacher(s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>Algebra 1</TableCell>
                <TableCell>Math</TableCell>
                <TableCell>Teacher1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>1</TableCell>
                <TableCell>Geography</TableCell>
                <TableCell>Social Studies,ESL</TableCell>
                <TableCell>Teacher2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2</TableCell>
                <TableCell>Reading Skills</TableCell>
                <TableCell>ELA,ESL</TableCell>
                <TableCell>Teacher3</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>US History</TableCell>
                <TableCell>Social Studies</TableCell>
                <TableCell>Teacher4,Teacher5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell>World Literature</TableCell>
                <TableCell>ELA</TableCell>
                <TableCell>Teacher6</TableCell>
              </TableRow>
            </TableBody>
          </SpreadSheetTable>
        </TableContainer>
      </FileDescriptionModal>

      {/* Student data file description */}
      <FileDescriptionModal
        open={studentFileModalOpen}
        onClose={() => {
          setStudentFileModalOpen(false);
        }}
        title="Student data file"
      >
        <Typography variant="body1">
          Student data is uploaded in a spreadsheet in TSV format with the columns shown
          below. The column titles dont&apos;t need to tbe the same, but the order of
          the columns should match the example.
        </Typography>
        <ul style={{ marginTop: "0.5rem" }}>
          <li>
            Adding a required subject area for a student forces the solver to assign the
            student at least one course in that subject area.
          </li>
          <li>
            Multiple required subjects can be used for a single student separated by
            commas.
          </li>
          <li>
            Course titles are case-insensitive and will be matched with the course data
            list to find the period and number of teachers for each course.
          </li>
        </ul>
        <TableContainer>
          <SpreadSheetTable
            aria-label="student-file-spreadsheet-format"
            sx={{ borderRadius: 2 }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Required Subjects</TableCell>
                <TableCell>
                  1<sup>st</sup> choice course period 1
                </TableCell>
                <TableCell>
                  2<sup>nd</sup> choice course period 1
                </TableCell>
                <TableCell>&hellip;</TableCell>
                <TableCell>
                  1<sup>st</sup> choice course last period
                </TableCell>
                <TableCell>
                  2<sup>nd</sup> choice course last period
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Student1</TableCell>
                <TableCell>ESL</TableCell>
                <TableCell>Algebra 1</TableCell>
                <TableCell>Geography</TableCell>
                <TableCell>&hellip;</TableCell>
                <TableCell>Physics</TableCell>
                <TableCell>US History</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Student2</TableCell>
                <TableCell>ESL,Math</TableCell>
                <TableCell>Astronomy</TableCell>
                <TableCell>Algebra 1</TableCell>
                <TableCell>&hellip;</TableCell>
                <TableCell>US History</TableCell>
                <TableCell>World Literature</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Student3</TableCell>
                <TableCell></TableCell>
                <TableCell>Geography</TableCell>
                <TableCell>Astronomy</TableCell>
                <TableCell>&hellip;</TableCell>
                <TableCell>World Literature</TableCell>
                <TableCell>Physics</TableCell>
              </TableRow>
            </TableBody>
          </SpreadSheetTable>
        </TableContainer>
      </FileDescriptionModal>
    </AppTheme>
  );
}
