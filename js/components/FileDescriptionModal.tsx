import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
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
        <Typography variant="h6" id={`${title}-modal-title`}>
          {title}
        </Typography>
        <Box id={`${title}-modal-description`}>{children}</Box>
      </Paper>
    </Modal>
  );
}
