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

export default function TSVDropZone({
  title,
  file,
  setFile,
}: {
  title: string;
  file: File;
  setFile: React.Dispatch<React.SetStateAction<File>>;
}) {
  const styles: SxProps = {
    display: "flex",
    color: file ? "black" : "darkgray",
    bgcolor: "#EEEEEE",
    border: 1.5,
    borderColor: "darkgray",
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
            <IconButton aria-label="delete" onClick={() => setFile(undefined)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Box>
      ) : (
        <Button variant="outlined" color="info" component="label" sx={styles}>
          <Dropzone onDrop={(acceptedFiles) => setFile(acceptedFiles[0])}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <Stack alignItems="center">
                  <SaveAltIcon />
                  <Typography>
                    Drag and drop files or click to select
                  </Typography>
                </Stack>
              </div>
            )}
          </Dropzone>
        </Button>
      )}
    </Paper>
  );
}
