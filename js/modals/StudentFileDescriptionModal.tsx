import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import FileDescriptionModal from "../components/FileDescriptionModal";
import SpreadSheetTable from "../components/SpreadSheetTable";
import type ModalProps from "./ModalProps";

/** Modal component with a description of the student data file. */
export default function StudentFileDescriptionModal({ open, setOpen }: ModalProps) {
  return (
    <FileDescriptionModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Student data file"
    >
      <Typography variant="body1">
        Student data is uploaded in a spreadsheet in TSV format with the columns shown
        below. The column titles dont&apos;t need to tbe the same, but the order of the
        columns should match the example.
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
          Course titles are case-insensitive. The preference columns will be matched
          with the course data list based on the start of the provided value. For
          example, &ldquo;Physics (Teacher1 and Teacher2)&rdquo; would match with a
          course titled &ldquo;Physics&rdquo; in the same period. Note that this could
          lead to unexpected behavior if there is a course title that starts with
          another course&apos;s title, like &ldquo;Physics&rdquo; and &ldquo;Physics
          2&rdquo;. In that case, the example above could match with either course.
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
  );
}
