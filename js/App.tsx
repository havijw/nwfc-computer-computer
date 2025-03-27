import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import TSVDropZone from "./components/TSVDropzone";
import Typography from "@mui/material/Typography";
import { useState } from "react";

function FileCard(props: {
  title: string;
  file: File;
  setFile: React.Dispatch<React.SetStateAction<File>>;
}) {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <TSVDropZone {...props} />
    </Grid>
  );
}

export default function App() {
  const [studentFile, setStudentFile] = useState<File>();
  const [teacherFile, setTeacherFile] = useState<File>();
  const [courseFile, setCourseFile] = useState<File>();
  const [preferencesFile, setPreferencesFile] = useState<File>();

  return (
    <>
      <CssBaseline enableColorScheme />
      <Container component="header" maxWidth="lg" sx={{ paddingY: "1rem" }}>
        <Typography variant="h5">NWFC Computer-Computer</Typography>
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
          <FileCard
            title="Student List"
            file={studentFile}
            setFile={setStudentFile}
          />
          <FileCard
            title="Teacher List"
            file={teacherFile}
            setFile={setTeacherFile}
          />
          <FileCard
            title="Course List"
            file={courseFile}
            setFile={setCourseFile}
          />
          <FileCard
            title="Course Preferences"
            file={preferencesFile}
            setFile={setPreferencesFile}
          />
        </Grid>
      </Container>
      <Container
        component="footer"
        sx={{ textAlign: "center", padding: "0.5rem" }}
      >
        &copy;Jack Haviland 2025
      </Container>
    </>
  );
}
