import { useEffect, useCallback, useMemo, useState } from "react";
import { Row, Col, Button, Modal, Form } from "react-bootstrap";

import { FiPlus, FiEdit2 } from "react-icons/fi";

import {
  createExpenditure,
  getExpenditures,
  updateExpenditure,
} from "../../services/expenditureService";

// import { canEdit } from "../../utils/permissions";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";
import DescriptionCell from "../ui/DescriptionCell/DescriptionCell.jsx";

const PAYMENT_METHODS = ["UPI", "Bank Transfer", "Cash"];

const Expenditure = () => {
  const [expenditures, setExpenditures] = useState([]);

  const emptyExpenditure = {
    title: "",
    amount: "",
    paymentMethod: "UPI",
    date: "",
    purpose: "",
  };
  const [expenditureForm, setExpenditureForm] = useState(emptyExpenditure);

  const [expenditureModal, setExpenditureModal] = useState(false);
  const [editingExpenditureId, setEditingExpenditureId] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isExpendituresLoading, setIsExpendituresLoading] = useState(true);
  const [isCreatingExpenditure, setIsCreatingExpenditure] = useState(false);
  const [isUpdatingExpenditure, setIsUpdatingExpenditure] = useState(false);

  const pageSize = 5;

  const handleExpenditureChange = (e) => {
    const { name, value } = e.target;

    setExpenditureForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: "Title",
        accessor: "title",
      },
      {
        header: "Amount",
        accessor: "amount",
        cell: (row) => (
          <span>₹{Number(row.amount).toLocaleString("en-IN")}</span>
        ),
      },
      {
        header: "Payment Method",
        accessor: "paymentMethod",
      },
      {
        header: "Date",
        accessor: "date",
      },
      {
        header: "Purpose",
        accessor: "purpose",
        // cell: (row) => row.purpose || "-",
        cell: (row) => <DescriptionCell text={row.purpose || "-"} />,
      },
    ],
    [],
  );

  // Open Add Drawer
  const handleAddExpenditure = () => {
    setExpenditureForm({ ...emptyExpenditure });
    setEditingExpenditureId(null);
    setExpenditureModal(true);
  };

  // Open Edit Modal
  const handleEditExpenditure = (row) => {
    setEditingExpenditureId(row.expenditureId);

    setExpenditureForm({
      title: row.title || "",
      amount: row.amount || "",
      paymentMethod: row.paymentMethod || "UPI",
      date: row.date || "",
      purpose: row.purpose || "",
    });

    setExpenditureModal(true);
  };

  const handleCloseModal = () => {
    setExpenditureModal(false);
    setEditingExpenditureId(null);
    setExpenditureForm({ ...emptyExpenditure });
  };

  const fetchExpenditures = useCallback(async () => {
    try {
      const response = await getExpenditures();

      if (response.statusCode === 200) {
        const formattedData = (response.data || []).map((item) => ({
          expenditureId: item.expenditure_id,
          title: item.title,
          amount: item.amount,
          paymentMethod: item.payment_method,
          date: item.expenditure_date,
          purpose: item.purpose,
        }));

        setExpenditures(formattedData);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Get Expenditure Error:", error);
      toast.error(error.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    const loadExpenditures = async () => {
      setIsExpendituresLoading(true);

      try {
        await fetchExpenditures();
      } finally {
        setIsExpendituresLoading(false);
      }
    };

    loadExpenditures();
  }, [fetchExpenditures]);

  const handleSaveExpenditure = async () => {
    if (
      !expenditureForm.title ||
      !expenditureForm.amount ||
      !expenditureForm.date ||
      !expenditureForm.paymentMethod
    ) {
      toast.error("Please fill required fields");
      return;
    }

    const amount = Number(
      String(expenditureForm.amount).replace(/[^0-9.]/g, ""),
    );

    const payload = {
      title: expenditureForm.title,
      amount: amount,
      payment_method: expenditureForm.paymentMethod,
      expenditure_date: expenditureForm.date,
      purpose: expenditureForm.purpose,
    };

    if (editingExpenditureId) {
      await handleUpdateExpenditure(payload);
    } else {
      await handleCreateExpenditure(payload);
    }
  };

  // CREATE EXPENDITURE
  const handleCreateExpenditure = async (payload) => {
    setIsCreatingExpenditure(true);

    try {
      const response = await createExpenditure(payload);

      if (response.statusCode === 201) {
        toast.success(response.message);

        await fetchExpenditures();

        handleCloseModal();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create Expenditure Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsCreatingExpenditure(false);
    }
  };

  // UPDATE EXPENDITURE
  const handleUpdateExpenditure = async (payload) => {
    if (!editingExpenditureId) return;

    setIsUpdatingExpenditure(true);

    try {
      const response = await updateExpenditure(editingExpenditureId, payload);

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchExpenditures();

        handleCloseModal();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update Expenditure Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsUpdatingExpenditure(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  // Filter & Search Logic
  const filteredExpenditures = useMemo(() => {
    return expenditures.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.title?.toLowerCase().includes(searchValue) ||
        item.paymentMethod?.toLowerCase().includes(searchValue) ||
        item.amount?.toString().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;
          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [expenditures, search, activeFilters]);

  const totalPages = Math.ceil(filteredExpenditures.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedExpenditures = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredExpenditures.slice(startIndex, startIndex + pageSize);
  }, [filteredExpenditures, safeCurrentPage]);

  return (
    <div className="common-management-main-section">
      {/* Header section */}
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Expenditure Management</h2>
          <p className="all-dash-page-subtitle">
            {/* Track and manage operational expenses */}
            Track total expenses, monthly spending, and expense categories.
          </p>
        </div>

        {/* {canCreate() && ( */}
        <Button
          className="dashboard-action-primary-btn"
          onClick={handleAddExpenditure}
        >
          <FiPlus className="dashboard-action-primary-btn-icon" />
          Add Expenditure
        </Button>
        {/* )} */}
      </div>

      {/* Loader */}
      {isExpendituresLoading ? (
        <div className="ui-common-loader">
          <ThreeDots
            height="20"
            width="50"
            color="#057DCD"
            ariaLabel="loading"
          />
        </div>
      ) : (
        <>
          {/* Filter and Toolbar */}
          <TableToolbar
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            filters={[
              {
                key: "paymentMethod",
                label: "Payment",
                options: PAYMENT_METHODS,
              },
            ]}
            activeFilters={activeFilters}
            setActiveFilters={(value) => {
              setActiveFilters(value);
              setCurrentPage(1);
            }}
            onClear={handleClearFilters}
            data={filteredExpenditures}
            columns={columns}
            exportFileName="expenditure_list"
          />

          {/* Expenditure Table */}
          <Table
            columns={columns}
            data={paginatedExpenditures}
            rowKey="expenditureId"
            actions={(row) => (
              <div className="common-management-action-buttons">
                <button
                  title="Edit Expenditure"
                  onClick={() => handleEditExpenditure(row)}
                >
                  <FiEdit2 />
                </button>
              </div>
            )}
          />
        </>
      )}

      {/* Pagination Footer */}
      {!isExpendituresLoading && filteredExpenditures.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredExpenditures.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Add Expenditure Modal */}
      <Modal
        show={expenditureModal}
        onHide={handleCloseModal}
        backdrop="static"
        keyboard={false}
        centered
        className="notification-modal-main"
      >
        <Modal.Header closeButton className="notification-modal-header">
          <Modal.Title className="notification-modal-title">
            {editingExpenditureId ? "Edit Expenditure" : "Add Expenditure"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="notification-modal-body">
          {/* Expenditure Title */}
          <Form.Group className="mb-3">
            <Form.Label className="notification-modal-form-label">
              Title<span className="ui-form-field-required">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={expenditureForm.title}
              onChange={handleExpenditureChange}
              className="notification-modal-form-input"
              placeholder="e.g. Equipment Purchase"
            />
          </Form.Group>

          <Row className="mb-3">
            {/* Amount */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="notification-modal-form-label">
                  Amount (₹)<span className="ui-form-field-required">*</span>
                </Form.Label>
                <Form.Control
                  // type="number"

                  name="amount"
                  value={expenditureForm.amount}
                  onChange={handleExpenditureChange}
                  className="notification-modal-form-input"
                  placeholder="Enter amount"
                />
              </Form.Group>
            </Col>

            {/* Payment Method */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="notification-modal-form-label">
                  Payment Type <span className="ui-form-field-required">*</span>
                </Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={expenditureForm.paymentMethod}
                  onChange={handleExpenditureChange}
                  className="notification-modal-form-input"
                >
                  {PAYMENT_METHODS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Expense Date */}
          <Form.Group className="mb-3">
            <Form.Label className="notification-modal-form-label">
              Date<span className="ui-form-field-required">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={expenditureForm.date}
              onChange={handleExpenditureChange}
              className="notification-modal-form-input"
            />
          </Form.Group>

          {/* purpose / Description */}
          <Form.Group>
            <Form.Label className="notification-modal-form-label">
              Purpose
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="purpose"
              value={expenditureForm.purpose}
              onChange={handleExpenditureChange}
              placeholder="Add optional expense details..."
              className="notification-modal-form-input"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="notification-modal-footer">
          <Button
            onClick={handleCloseModal}
            className="notification-modal-footer-btn-cancel"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveExpenditure}
            className="notification-modal-footer-btn-send"
            disabled={isCreatingExpenditure || isUpdatingExpenditure}
          >
            {isCreatingExpenditure || isUpdatingExpenditure
              ? editingExpenditureId
                ? "Updating..."
                : "Saving..."
              : editingExpenditureId
                ? "Update Expenditure"
                : "Save Expenditure"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Expenditure;
