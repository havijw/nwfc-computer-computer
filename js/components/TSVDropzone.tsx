import Button from "@mui/material/Button";
import Dropzone from "react-dropzone";
import Paper from "@mui/material/Paper";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function TSVDropZone({ title }: { title: string }) {
  return (
    <Paper elevation={3} sx={{ padding: "0.5rem" }}>
      <Typography align="center">{title}</Typography>
      <Button
        variant="outlined"
        color="info"
        component="label"
        sx={{
          display: "flex",
          color: "darkgray",
          bgcolor: "#EEEEEE",
          border: 1.5,
          borderColor: "darkgray",
          borderStyle: "dashed",
          p: "1rem",
        }}
      >
        <Dropzone onDrop={(acceptedFiles) => console.log(acceptedFiles)}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Stack alignItems="center">
                <SaveAltIcon />
                <Typography>Drag and drop files or click to select</Typography>
              </Stack>
            </div>
          )}
        </Dropzone>
      </Button>
    </Paper>
  );
}
