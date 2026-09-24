import { Modal, Button } from "react-bootstrap";
import { FiAlertTriangle } from "react-icons/fi";

import "./ConfirmDialog.css";

const ConfirmDialog = ({
  show,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Do you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  disabled = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    // onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      className="confirm-dialog-modal"
    >
      <Modal.Header closeButton className="confirm-dialog-header">
        <Modal.Title className="confirm-dialog-title">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="confirm-dialog-body">
        <div className="confirm-dialog-message-wrapper">
          <div className="confirm-dialog-warning-icon">
            <FiAlertTriangle />
          </div>

          <p className="confirm-dialog-message-text">{message}</p>
        </div>
      </Modal.Body>

      <Modal.Footer className="confirm-dialog-footer">
        <Button className="confirm-dialog-cancel-button" onClick={onClose}>
          {cancelText}
        </Button>

        <Button
          className="confirm-dialog-confirm-button"
          onClick={handleConfirm}
          disabled={disabled}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;
