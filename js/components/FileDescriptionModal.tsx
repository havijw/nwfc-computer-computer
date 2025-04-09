import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/** Props for the `FileDescriptionModal` component. */
interface FileDescriptionModalProps {
  /** Whether the modal is currently open. */
  open: boolean;

  /** Function to close the modal. */
  onClose: () => void;

  /** Displayed title for the component. */
  title: string;

  /** Child nodes containing modal information. */
  children: React.ReactNode;
}

/** Base modal component to hold file descriptions. */
export default function FileDescriptionModal({
  open,
  onClose,
  title,
  children,
}: FileDescriptionModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby={`${title}-modal-title`}
      aria-describedby={`${title}-modal-description`}
    >
      <Paper
        sx={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translate(-50%, 0%)",
          width: "80%",
          maxHeight: "80%",
          overflow: "scroll",
          padding: "1rem",
        }}
      >
        <Stack direction="row" alignItems="center" sx={{ marginBottom: "0.5rem" }}>
          <Typography variant="h6" id={`${title}-modal-title`} sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton aria-label="close" onClick={onClose} sx={{ margin: "-8px" }}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Box id={`${title}-modal-description`}>{children}</Box>
      </Paper>
    </Modal>
  );
}
