import Button from "@mui/material/Button";
import Dropzone from "react-dropzone";
import Paper from "@mui/material/Paper";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import BorderAllIcon from "@mui/icons-material/BorderAll";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { IconButton, SxProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function TSVDropZone({
  title,
  file,
  setFile,
}: {
  title: string;
  file: File | undefined;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}) {
  const theme = useTheme();
  const styles: SxProps = {
    display: "flex",
    color: file ? theme.palette.text.primary : theme.palette.text.secondary,
    bgcolor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[200],
    border: 2,
    borderColor: theme.palette.divider,
    borderStyle: "dashed",
    padding: "1rem",
    height: "100%",
    borderRadius: "0.25rem",
  };

  return (
    <Paper elevation={3} sx={{ padding: "0.5rem" }}>
      <Typography align="center">{title}</Typography>
      {file ? (
        <Box sx={styles}>
          <Stack alignItems="center" direction="row" flexGrow={1}>
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
              <Button variant="outlined" color="info" component="label" sx={styles}>
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
