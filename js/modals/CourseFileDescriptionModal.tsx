import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import FileDescriptionModal from "../components/FileDescriptionModal";
import SpreadSheetTable from "../components/SpreadSheetTable";
import type ModalProps from "./ModalProps";

/** Modal component with a description of the courses file. */
export default function CourseFileDescriptionModal({ open, setOpen }: ModalProps) {
  return (
    <FileDescriptionModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title="Courses file"
    >
      <Typography variant="body1">
        The course list is uploaded in a spreadsheet in TSV format with the columns
        shown below. The column titles dont&apos;t need to tbe the same, but the order
        of the columns should match the example.
      </Typography>
      <ul style={{ marginTop: "0.5rem" }}>
        <li>
          Subject areas and teacher names should be in a single cell for each course,
          separated by commas.
        </li>
        <li>
          Subject areas are case-insensitive and are matched with student subject
          requirements from the students & preferences file.
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
  );
}
