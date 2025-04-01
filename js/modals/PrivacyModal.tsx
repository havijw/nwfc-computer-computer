import Modal from "@mui/material/Modal";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import ModalProps from "./ModalProps";

/** Modal component with privacy information for the site. */
export default function PrivacyModal({ open, setOpen }: ModalProps) {
  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      aria-labelledby="privacy-modal-title"
      aria-describedby="privacy-modal-description"
    >
      <Paper
        sx={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          p: "1rem",
        }}
      >
        <Typography variant="h6" id="privacy-modal-title">
          Privacy Policy
        </Typography>
        <Typography variant="body1" id="privacy-modal-description">
          No information is collected or stored, ever. Your files do not leave your
          computer — you can verify this by loading the page, waiting for the solver to
          load, turning off your network connection (WiFi), and checking that the solver
          still runs.
        </Typography>
      </Paper>
    </Modal>
  );
}
