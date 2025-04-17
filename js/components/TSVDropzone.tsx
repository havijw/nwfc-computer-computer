import BorderAllIcon from "@mui/icons-material/BorderAll";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { useTheme, SxProps } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Dropzone from "react-dropzone";

/** Props for the `TSVDropZone` component. */
interface TSVDropZoneProps {
  /** Displayed title for the component. */
  title: string;

  /** File object updated by the component.
   *
   * Should be React state along with the `setFile` function prop.
   * Used by component to change appearance when a file has been uploaded.
   */
  file: File | undefined;

  /** Update function for the file object of the component.
   *
   * Should come from React state along with the `file` prop.
   */
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;

  /** Function that opens a (modal) description of the file the component expects. */
  openDescription: () => void;
}

/** Component with a file upload drop zone meant to work with React state. */
export default function TSVDropZone({
  title,
  file,
  setFile,
  openDescription,
}: TSVDropZoneProps) {
  const theme = useTheme();
  const dropzoneStyles: SxProps = {
    height: "5rem",
    display: "flex",
    color: file ? theme.palette.text.primary : theme.palette.text.secondary,
    bgcolor: theme.palette.action.selected,
    border: 2,
    borderColor: theme.palette.divider,
    borderStyle: "dashed",
    padding: "1rem",
    borderRadius: "0.25rem",
  };

  return (
    <Paper elevation={3} sx={{ padding: "0.5rem" }}>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={-0.5}>
        <Typography align="center">{title}</Typography>
        <IconButton onClick={openDescription} aria-label={`Open ${title} description`}>
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>
      {file ? (
        <Box sx={dropzoneStyles}>
          <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>
            <BorderAllIcon />
            <Typography flexGrow={1}>{file.name}</Typography>
            <IconButton
              aria-label="delete"
              onClick={() => {
                setFile(undefined);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Box>
      ) : (
        <Dropzone
          onDrop={(acceptedFiles) => {
            setFile(acceptedFiles[0]);
          }}
        >
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <Button
                variant="outlined"
                color="info"
                component="label"
                sx={{
                  ...dropzoneStyles,
                  ":hover": { bgcolor: theme.palette.action.focus },
                }}
              >
                <input {...getInputProps()} />
                <Stack alignItems="center">
                  <SaveAltIcon />
                  <Typography>Drag and drop files or click to select</Typography>
                </Stack>
              </Button>
            </div>
          )}
        </Dropzone>
      )}
    </Paper>
  );
}
