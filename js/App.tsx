import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import TSVDropZone from "./components/TSVDropzone";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export default function App() {
  const [studentFile, setStudentFile] = useState<File>();
  const [teacherFile, setTeacherFile] = useState<File>();
  const [courseFile, setCourseFile] = useState<File>();
  const [preferencesFile, setPreferencesFile] = useState<File>();

  return (
    <>
      <CssBaseline enableColorScheme />
      <header>
        <Container maxWidth="lg" sx={{ paddingY: "1rem" }}>
          <Typography variant="h5">NWFC Computer-Computer</Typography>
        </Container>
      </header>
      <Container
        fixed
        maxWidth="lg"
        sx={{
          paddingY: "1rem",
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TSVDropZone
              title="Student List"
              file={studentFile}
              setFile={setStudentFile}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TSVDropZone
              title="Teacher List"
              file={teacherFile}
              setFile={setTeacherFile}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TSVDropZone
              title="Course List"
              file={courseFile}
              setFile={setCourseFile}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TSVDropZone
              title="Course Preferences"
              file={preferencesFile}
              setFile={setPreferencesFile}
            />
          </Grid>
        </Grid>
      </Container>
      <footer style={{ textAlign: "center" }}>&copy;Jack Haviland 2025</footer>
    </>
  );
}
