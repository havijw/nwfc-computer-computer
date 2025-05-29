import { useMemo, useState } from "react";

import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid2";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import { Course, Student } from "../models";

/** Split a set of course assignments into subgroups by period. */
function getPeriodGroupAssignments(courseAssignments: [Course, Student[]][]) {
  const periodGroups = new Map<number, [Course, Student[]][]>();
  for (const [course, students] of courseAssignments) {
    if (!periodGroups.has(course.period)) {
      periodGroups.set(course.period, []);
    }
    periodGroups.get(course.period)?.push([course, students]);
  }
  // Ensure groups are sorted by period
  return Array.from(periodGroups.values()).sort(
    ([[course1]], [[course2]]) => course1.period - course2.period,
  );
}

/** Component for showing a list of students assigned to a course. */
function CourseStudentsDisplay({
  course,
  students,
  showStudents,
  setShowStudents,
}: {
  course: Course;
  students: Student[];
  showStudents: boolean;
  setShowStudents: (
    modifyShowStudents: boolean | ((oldShowStudents: boolean) => boolean),
  ) => void;
}) {
  return (
    <Paper variant="outlined" sx={{ padding: "0.5rem" }}>
      <Typography>
        <strong>{course.title}</strong>
      </Typography>
      <Typography>
        <i>{course.teachers.join(", ")}</i>
      </Typography>
      <Button
        title={(showStudents ? "Hide" : "Show") + " student list"}
        aria-label={(showStudents ? "Hide" : "Show") + " student list"}
        variant="outlined"
        onClick={() => {
          setShowStudents((show) => !show);
        }}
        sx={{ padding: "0.25rem" }}
        endIcon={showStudents ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      >
        <small>{students.length} students</small>
      </Button>
      <Collapse in={showStudents} sx={{ marginTop: "0.25rem" }}>
        {students.map((student) => (
          <Typography key={student.name}>
            <small>{student.name}</small>
          </Typography>
        ))}
      </Collapse>
    </Paper>
  );
}

/** Component for showing students assigned to all courses in a period.
 *
 * Note: assumes all courses in the list have the same period.
 */
function PeriodCourseAssignmentDisplay({
  courseAssignments,
}: {
  courseAssignments: [Course, Student[]][];
}) {
  const [showPeriodStudents, setShowPeriodStudents] = useState(
    courseAssignments.map(() => false),
  );
  const allPeriodsShown = useMemo(
    () => showPeriodStudents.every((value) => value),
    [showPeriodStudents],
  );
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{ padding: "0.5rem", bgcolor: theme.palette.action.selected }}
    >
      <Stack
        direction="row"
        alignItems="baseline"
        spacing={2}
        sx={{ marginBottom: "0.5rem" }}
      >
        <Typography variant="h6" sx={{ marginBottom: "0.25rem", fontSize: "xxl" }}>
          Period {courseAssignments[0][0].period}
        </Typography>
        <Button
          title={(allPeriodsShown ? "Hide" : "Show") + " all student lists"}
          aria-label={(allPeriodsShown ? "Hide" : "Show") + " all student lists"}
          variant="outlined"
          size="small"
          sx={{ fontWeight: "normal" }}
          onClick={() => {
            setShowPeriodStudents((prevShowStudents) =>
              prevShowStudents.map(() => !allPeriodsShown),
            );
          }}
          endIcon={allPeriodsShown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {allPeriodsShown ? "Collapse All" : "Expand All"}
        </Button>
      </Stack>
      <Grid container spacing={1}>
        {courseAssignments.map(([course, students], i) => (
          <Grid size={{ xs: 6, md: 3 }} key={course.title + String(course.period)}>
            <CourseStudentsDisplay
              course={course}
              students={students}
              showStudents={showPeriodStudents[i]}
              setShowStudents={(value) => {
                setShowPeriodStudents((prevShowStudents) =>
                  typeof value === "function"
                    ? prevShowStudents.map((v, j) => (j === i ? value(v) : v))
                    : prevShowStudents.map((v, j) => (j === i ? value : v)),
                );
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

/** Props for the `CourseAssignmentDisplay` component. */
interface CourseAssignmentDisplayProps {
  /** Array of `[course, students]` pairs where `students` is the array of students
   * assigned to `course`.
   */
  courseAssignments: [Course, Student[]][];
}

/** Component for displaying assignments of students to courses.
 *
 * Courses are visually grouped by period and full student lists are collapsed by
 * default.
 */
export default function CourseAssignmentDisplay({
  courseAssignments,
}: CourseAssignmentDisplayProps) {
  return (
    <>
      {getPeriodGroupAssignments(courseAssignments).map((periodAssignments) => (
        <PeriodCourseAssignmentDisplay
          courseAssignments={periodAssignments}
          key={courseAssignments[0][0].period}
        />
      ))}
    </>
  );
}
