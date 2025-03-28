import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { Course, Student } from "../models";

export default function CoursesDisplay({
  loadingSolver,
  waitingForFiles,
  courseAssignments,
}: {
  loadingSolver: boolean;
  waitingForFiles: boolean;
  courseAssignments: [Course, Student[]][];
}) {
  const theme = useTheme();
  return (
    <Paper elevation={3} sx={{ marginTop: "1rem", padding: "0.5rem" }}>
      {loadingSolver ? (
        <p style={{ textAlign: "center", color: theme.palette.text.secondary }}>
          Loading solver...
        </p>
      ) : waitingForFiles ? (
        <p style={{ textAlign: "center", color: theme.palette.text.secondary }}>
          Upload files to determine course assignments
        </p>
      ) : courseAssignments.length ? (
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
      ) : (
        <p style={{ textAlign: "center", color: theme.palette.text.secondary }}>
          Finding optimal course assignments...
        </p>
      )}
    </Paper>
  );
}
