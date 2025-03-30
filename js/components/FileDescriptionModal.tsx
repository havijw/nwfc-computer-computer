import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

export default function FileDescriptionModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
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
