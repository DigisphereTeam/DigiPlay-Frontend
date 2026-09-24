import * as XLSX from "xlsx";

import { Form, Button, Row, Col } from "react-bootstrap";
import { FiSearch, FiDownload, FiX } from "react-icons/fi";

import toast from "react-hot-toast";

// FiPrinter

import "./TableToolbar.css";

const TableToolbar = ({
  search,
  setSearch,

  // Date filters
  fromDate = "",
  setFromDate,
  toDate = "",
  setToDate,

  // Search column size
  searchColLg = 4,

  filters = [],
  activeFilters = {},
  setActiveFilters,
  onClear,
  data = [],
  columns = [],
  exportFileName = "table-data",

  //   onPrint,
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
  };

  return (
    <div className="table-toolbar-main-wrapper">
      <Row className="g-3 align-items-center">
        {/* Search */}
        <Col lg={searchColLg} md={6}>
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
        {setFromDate && (
          <Col lg={2} md={6}>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="table-toolbar-form-select"
              title="From Date"
            />
          </Col>
        )}

        {/* To Date */}
        {setToDate && (
          <Col lg={2} md={6}>
            <Form.Control
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="table-toolbar-form-select"
              title="To Date"
            />{" "}
          </Col>
        )}

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <Col lg={2} md={6} key={filter.key}>
            <Form.Select
              value={activeFilters[filter.key] || "All"}
              onChange={(e) =>
                setActiveFilters({
                  ...activeFilters,
                  [filter.key]: e.target.value,
                })
              }
              className="table-toolbar-form-select"
            >
              <option value="All">{filter.label}: All</option>

              {filter.options.map((option) => (
                <option
                  key={option.value ?? option}
                  value={option.value ?? option}
                >
                  {option.label ?? option}
                </option>
              ))}
            </Form.Select>
          </Col>
        ))}
        {/* Buttons */}
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

            {/* <Button variant="outline-secondary" onClick={onPrint}>
              <FiPrinter />
              Print
            </Button> */}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default TableToolbar;
