import Table from "@mui/material/Table";
import { styled, Theme } from "@mui/material/styles";

/**
 * Table component with dividers between all cells and rounded corners.
 */
const SpreadSheetTable = styled(Table)(({ theme }: { theme: Theme }) => ({
  borderCollapse: "separate",
  border: "1px solid",
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  "& th": {
    borderLeft: "1px solid",
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.action.selected,
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

export default SpreadSheetTable;
