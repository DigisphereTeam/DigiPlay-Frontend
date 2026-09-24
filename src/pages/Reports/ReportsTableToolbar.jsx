import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Form, Button, Row, Col } from "react-bootstrap";

import { FiSearch, FiDownload, FiX, FiCalendar } from "react-icons/fi";

import toast from "react-hot-toast";

const ReportsTableToolbar = ({
  search,
  setSearch,

  fromDate,
  setFromDate,

  toDate,
  setToDate,

  onClear,

  data = [],
  columns = [],
  exportFileName = "reports",
}) => {
  const handleExport = () => {
    if (!data.length) {
      toast.error("No data available to export");
      return;
    }

    const exportData = data.map((row) => {
      const obj = {};

      columns.forEach((column) => {
        if (column.accessor) {
          obj[column.header] = row[column.accessor];
        }
      });

      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

    XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;

    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  const formatDate = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleFromDateChange = (date) => {
    setFromDate(formatDate(date));
  };

  const handleToDateChange = (date) => {
    setToDate(formatDate(date));
  };

  return (
    <div className="table-toolbar-main-wrapper">
      <Row className="g-3 align-items-center">
        {/* Search */}
        <Col lg={3} md={6}>
          <div className="table-toolbar-search-box">
            <FiSearch className="table-toolbar-search-icon" />

            <Form.Control
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="table-toolbar-search-input"
            />
          </div>
        </Col>

        {/* From Date */}
        <Col lg={2} md={6}>
          <div className="table-toolbar-search-box">
            <FiCalendar className="table-toolbar-search-icon" />

            <DatePicker
              selected={parseDate(fromDate)}
              onChange={handleFromDateChange}
              dateFormat="dd MMM, yyyy"
              placeholderText="From Date"
              className="table-toolbar-search-input form-control custom-datepicker-input"
            />
          </div>
        </Col>

        {/* To Date */}
        <Col lg={2} md={6}>
          <div className="table-toolbar-search-box">
            <FiCalendar className="table-toolbar-search-icon" />

            <DatePicker
              selected={parseDate(toDate)}
              onChange={handleToDateChange}
              dateFormat="dd MMM, yyyy"
              placeholderText="To Date"
              className="table-toolbar-search-input form-control custom-datepicker-input"
            />
          </div>
        </Col>

        {/* Actions */}
        <Col>
          <div className="table-toolbar-actions">
            <Button
              className="table-toolbar-actions-clear-btn"
              onClick={onClear}
            >
              <FiX />
              Clear
            </Button>

            <Button
              className="table-toolbar-actions-export-btn"
              onClick={handleExport}
            >
              <FiDownload />
              Export
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsTableToolbar;
