import { Button } from "react-bootstrap";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import "./TablePagination.css";

const TablePagination = ({
  page = 1,
  totalPages = 1,
  totalRecords = 0,
  pageSize = 10,
  onPrevious,
  onNext,
}) => {
  const startRecord = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;

  const endRecord = Math.min(page * pageSize, totalRecords);

  return (
    <div className="table-pagination-wrapper">
      {/* Left text */}
      <div className="table-pagination-info">
        Showing {startRecord}-{endRecord} of {totalRecords}
      </div>

      {/* Right controls */}
      <div className="table-pagination-controls">
        <Button
          className="table-pagination-btn"
          disabled={page === 1}
          onClick={onPrevious}
        >
          <FiChevronLeft />
        </Button>

        <span className="table-pagination-page-text">
          Page {page} of {totalPages || 1}
        </span>

        <Button
          className="table-pagination-btn"
          disabled={page === totalPages || totalPages === 0}
          onClick={onNext}
        >
          <FiChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default TablePagination;
