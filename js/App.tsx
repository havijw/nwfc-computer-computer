import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import TSVDropZone from "./components/TSVDropzone";
import Typography from "@mui/material/Typography";

export default function App() {
  return (
    <>
      <CssBaseline enableColorScheme />
      <header>
        <AppBar position="sticky">
          <Container maxWidth="lg" sx={{ paddingY: "1rem" }}>
            <Typography variant="h5">NWFC Computer-Computer</Typography>
          </Container>
        </AppBar>
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
            <TSVDropZone title="Student List" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TSVDropZone title="Teacher List" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TSVDropZone title="Course List" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TSVDropZone title="Course Preferences" />
          </Grid>
        </Grid>
      </Container>
      <footer style={{ textAlign: "center" }}>&copy;Jack Haviland 2025</footer>
    </>
  );
}
