/** Props for modal components. */
export default interface ModalProps {
  /** Whether the modal is open. */
  open: boolean;

  /** Update function for the `open` state. */
  setOpen: (open: boolean) => void;
}
