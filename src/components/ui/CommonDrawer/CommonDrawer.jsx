import { Offcanvas, Button, Form } from "react-bootstrap";

import "./CommonDrawer.css";

const CommonDrawer = ({
  show,
  onClose,
  title,
  children,
  onSave,
  onPrint,
  onDownload,
  saveText = "Save",
  printText = "Print",
  downloadText = "Download",
  width = 530,
  disabled = false,
}) => {
  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      backdrop="static"
      keyboard={false}
      // scroll
      style={{ width }}
      className="ui-common-drawer"
    >
      <Offcanvas.Header closeButton className="ui-common-drawer-header">
        <Offcanvas.Title className="ui-common-drawer-title">
          {title}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Form onSubmit={onSave} className="ui-common-drawer-form">
        <Offcanvas.Body className="ui-common-drawer-body">
          {children}
        </Offcanvas.Body>

        <div className="ui-common-drawer-footer">
          <Button
            type="button"
            className="ui-common-drawer-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </Button>

          {onPrint && (
            <Button
              type="button"
              disabled={disabled}
              className="ui-common-drawer-btn-save"
              onClick={onPrint}
            >
              {printText}
            </Button>
          )}

          {onDownload && (
            <Button
              type="button"
              disabled={disabled}
              className="ui-common-drawer-btn-save"
              onClick={onDownload}
            >
              {downloadText}
            </Button>
          )}

          {onSave && (
            <Button
              type="submit"
              disabled={disabled}
              className="ui-common-drawer-btn-save"
            >
              {saveText}
            </Button>
          )}
        </div>
      </Form>
    </Offcanvas>
  );
};

export default CommonDrawer;
