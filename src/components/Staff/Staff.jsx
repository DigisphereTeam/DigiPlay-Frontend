import { useMemo, useState, useEffect, useCallback } from "react";
import { Row, Col, Button } from "react-bootstrap";

import {
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiUserX,
  FiEdit2,
  // FiTrash2,
  FiEye,
  FiPlus,
  FiFileText,
  FiExternalLink,
} from "react-icons/fi";

import {
  getStaffs,
  createStaff,
  updateStaff,
  // deleteStaff,
  updateStaffStatus,
} from "../../services/staffService";
import { initialsFromName } from "../../utils/initialsFromName";
// import { canCreate, canEdit } from "../../utils/permissions";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import StatCard from "../../components/ui/StatCard/StatCard";
import CommonDrawer from "../../components/ui/CommonDrawer/CommonDrawer";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import FormField from "../../components/ui/FormField/FormField";
import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";
import DescriptionCell from "../ui/DescriptionCell/DescriptionCell.jsx";

// const DEPARTMENTS = [
//   "Administration",
//   "Housekeeping",
//   "Ground Maintenance",
//   "Security",
//   "Front Desk",
//   "Accounts",
//   "Equipment Store",
//   "Transport",
// ];

import "./Staff.css";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [statistics, setStatistics] = useState({});

  const emptyStaff = {
    staffName: "",
    phone: "",
    secondaryPhone: "",

    department: "",
    role: "",
    salary: "",
    joinDate: "",
    // leavesAvailable: "",

    advanceAmount: "",
    advanceDate: "",
    remarks: "",

    contactName: "",
    relation: "",
    contactPhone: "",

    document_urls: [],
  };

  const [staffData, setStaffData] = useState(emptyStaff);

  const [editId, setEditId] = useState(null);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [drawerTitle, setDrawerTitle] = useState("Add New Staff");
  
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  //loading
  const [isStaffLoading, setIsStaffLoading] = useState(true);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [isUpdatingStaff, setIsUpdatingStaff] = useState(false);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);

  const pageSize = 5;

  const handleStaffChange = (e) => {
    const { name, value, type, files } = e.target;

    setStaffData((prev) => ({
      ...prev,
      [name]: type === "file" ? Array.from(files) : value,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: "Staff",
        accessor: "staffName",
        cell: (row) => (
          <div className="common-management-name-cell">
            <div className="common-management-avatar">
              {initialsFromName(row.staffName)}
            </div>

            <div>
              <h6
                className="common-management-table-name"
                title={row.staffName || "-"}
              >
                {row.staffName || "-"}
              </h6>
              <span>{row.staffCode || "-"}</span>
            </div>
          </div>
        ),
      },

      {
        header: "Department",
        accessor: "department",
      },

      {
        header: "Role",
        accessor: "role",
      },

      {
        header: "Primary Phone",
        accessor: "phone",
      },

      {
        header: "Secondary Phone",
        accessor: "secondaryPhone",
        cell: (row) => row.secondaryPhone || "-",
      },

      // {
      //   header: "Leave Taken",
      //   accessor: "leaveTaken",
      // },
      {
        header: "Salary",
        accessor: "salary",
        cell: (row) => `₹${Number(row.salary || 0).toLocaleString("en-IN")}`,
      },

      {
        header: "Join Date",
        accessor: "joinDate",
        cell: (row) => row.joinDate || "-",
      },

      {
        header: "Advance",
        accessor: "advanceAmount",
        cell: (row) =>
          `₹${Number(row.advanceAmount || 0).toLocaleString("en-IN")}`,
      },

      {
        header: "Advance Date",
        accessor: "advanceDate",
        cell: (row) => row.advanceDate || "-",
      },

      {
        header: "Contact Name",
        accessor: "contactName",
        cell: (row) => row.contactName || "-",
      },

      {
        header: "Contact Relation",
        accessor: "relation",
        cell: (row) => row.relation || "-",
      },

      {
        header: "Contact Phone",
        accessor: "contactPhone",
        cell: (row) => row.contactPhone || "-",
      },

      {
        header: "Remarks",
        accessor: "remarks",
        cell: (row) => <DescriptionCell text={row.remarks || "-"} />,
      },

      {
        header: "Status",
        accessor: "status",
        cell: (row) => (
          <span
            className={
              row.status === "Active"
                ? "common-management-table-status-success"
                : row.status === "On Leave"
                  ? "common-management-table-status-warning"
                  : "common-management-table-status-danger"
            }
          >
            {row.status}
          </span>
        ),
      },
    ],
    [],
  );

  // Open Add Drawer
  const handleAddStaff = () => {
    setStaffData({ ...emptyStaff });
    setEditId(null);
    setDrawerTitle("Add New Staff");
    setShowDrawer(true);
  };

  // Open Edit Drawer
  const handleEditStaff = (row) => {
    setStaffData({
      staffName: row.staffName || "",
      phone: row.phone || "",
      secondaryPhone: row.secondaryPhone || "",

      department: row.department || "",
      role: row.role,
      salary: row.salary,
      joinDate: row.joinDate,

      advanceAmount: row.advanceAmount ?? "",
      advanceDate: row.advanceDate || "",
      remarks: row.remarks || "",

      contactName: row.contactName || "",
      relation: row.relation || "",
      contactPhone: row.contactPhone || "",
      //   leavesAvailable: row.leavesAvailable,
      document_urls: [],
    });

    setEditId(row.staffId);
    setDrawerTitle("Edit Staff");
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditId(null);
    setStaffData({ ...emptyStaff });
  };

  // Fetching Dat Get API //
  const fetchStaffList = useCallback(async () => {
    try {
      const response = await getStaffs();

      if (response.statusCode === 200) {
        const formattedStaff = (response.data.staff || []).map((item) => ({
          staffId: item.staff_id,
          staffCode: item.staff_code || "-",

          staffName: item.full_name || "-",
          phone: item.phone_number || "-",
          secondaryPhone: item.secondary_phone_number || "",

          department: item.department || "-",
          role: item.designation || "-",

          salary: item.salary || "-",
          joinDate: item.join_date,

          leaveTaken: item.leave_taken || 0,

          advanceAmount: item.advance_amount ?? "",
          advanceDate: item.advance_date || "",

          remarks: item.remarks || "",

          contactName: item.contact_name || "",
          relation: item.contact_relation || "",
          contactPhone: item.contact_phone || "",

          is_active: item.is_active,
          status: item.is_active ? "Active" : "Inactive",

          // Keep all uploaded document URLs
          document_urls: item.document_urls || [],
        }));
        setStaff(formattedStaff);
        setStatistics(response.data.statistics || {});
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Staff Error:", error);
      toast.error(error?.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    const loadStaffs = async () => {
      setIsStaffLoading(true);

      try {
        await fetchStaffList();
      } finally {
        setIsStaffLoading(false);
      }
    };

    loadStaffs();
  }, [fetchStaffList]);

  const handleSaveStaff = async (e) => {
    e.preventDefault();

    if (
      !staffData.staffName ||
      !staffData.phone ||
      !staffData.department ||
      !staffData.role ||
      !staffData.salary ||
      !staffData.joinDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(staffData.phone)) {
      toast.error("Please enter valid 10 digit phone number");
      return;
    }

    if (
      staffData.secondaryPhone &&
      !phoneRegex.test(staffData.secondaryPhone)
    ) {
      toast.error("Please enter valid 10 digit secondary phone number");
      return;
    }

    if (staffData.contactPhone && !phoneRegex.test(staffData.contactPhone)) {
      toast.error("Please enter valid 10 digit emergency contact number");
      return;
    }

    // const payload = {
    //   full_name: staffData.staffName,
    //   phone_number: staffData.phone,
    //   department: staffData.department,
    //   designation: staffData.role,
    //   salary: Number(staffData.salary),
    //   join_date: staffData.joinDate,
    // };

    const formData = new FormData();

    const salary = Number(String(staffData.salary).replace(/[^0-9.]/g, ""));

    const advanceAmount =
      staffData.advanceAmount === ""
        ? ""
        : Number(String(staffData.advanceAmount).replace(/[^0-9.]/g, ""));

    formData.append("full_name", staffData.staffName);
    formData.append("phone_number", staffData.phone);
    formData.append("secondary_phone_number", staffData.secondaryPhone || "");

    formData.append("department", staffData.department);
    formData.append("designation", staffData.role);

    formData.append("salary", salary);
    formData.append("join_date", staffData.joinDate);

    // Advance
    formData.append("advance_amount", advanceAmount);
    formData.append("advance_date", staffData.advanceDate || "");
    formData.append("remarks", staffData.remarks || "");

    // Emergency Contact
    formData.append("contact_name", staffData.contactName || "");
    formData.append("contact_relation", staffData.relation || "");
    formData.append("contact_phone", staffData.contactPhone || "");

    // Add multiple documents using the SAME field name
    if (staffData.document_urls?.length > 0) {
      staffData.document_urls.forEach((file) => {
        formData.append("document_urls", file);
      });
    }

    if (editId) {
      await handleUpdateStaff(formData);
    } else {
      await handleCreateStaff(formData);
    }
  };

  const handleCreateStaff = async (formData) => {
    setIsCreatingStaff(true);

    try {
      const response = await createStaff(formData);

      if (response.statusCode === 201) {
        toast.success(response.message);

        await fetchStaffList();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create Staff Error:", error);

      toast.error(error?.response?.data?.message);
    } finally {
      setIsCreatingStaff(false);
    }
  };

  const handleUpdateStaff = async (formData) => {
    setIsUpdatingStaff(true);

    try {
      const response = await updateStaff(editId, formData);

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchStaffList();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update Staff Error:", error);

      toast.error(error?.response?.data?.message);
    } finally {
      setIsUpdatingStaff(false);
    }
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (row) => {
    setSelectedStaff(row);
    setDeleteId(row.staffId);
    setShowConfirm(true);
  };

  // Execute Delete Staff
  // const handleDeleteStaff = async () => {
  //   if (!deleteId) return;

  //   setIsDeletingStaff(true);
  //   try {
  //     const response = await deleteStaff(deleteId);

  //     if (response.statusCode === 200) {
  //       toast.success(response.message);

  //       await fetchStaffList();

  //       setShowConfirm(false);
  //       setDeleteId(null);
  //     } else {
  //       toast.error(response.message);
  //     }
  //   } catch (error) {
  //     console.error("Delete  Staff Error:", error);

  //     toast.error(error?.response?.data?.message);
  //   } finally {
  //     setIsDeletingStaff(false);
  //   }
  // };

  // Status update

  const handleUpdateStaffStatus = async () => {
    if (!deleteId) return;

    setIsDeletingStaff(true);

    try {
      const response = await updateStaffStatus(
        deleteId,
        !selectedStaff.is_active,
      );

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchStaffList();

        setShowConfirm(false);
        setDeleteId(null);
        setSelectedStaff(null);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Status Update Error:", error);

      toast.error(error?.response?.data?.message);
    } finally {
      setIsDeletingStaff(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handleViewStaffDocuments = (row) => {
    const documents = row.document_urls || [];

    if (documents.length === 0) {
      toast.error("No documents available for this staff member");
      return;
    }

    setSelectedDocuments(documents);
    setShowDocuments(true);
  };

  const filteredStaff = useMemo(() => {
    return staff.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.staffName?.toLowerCase().includes(searchValue) ||
        item.staffCode?.toLowerCase().includes(searchValue) ||
        item.phone?.toLowerCase().includes(searchValue) ||
        item.department?.toLowerCase().includes(searchValue) ||
        item.role?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [staff, search, activeFilters]);

  const departmentOptions = useMemo(
    () => [...new Set(staff.map((item) => item.department).filter(Boolean))],
    [staff],
  );

  const statusOptions = useMemo(
    () => [...new Set(staff.map((item) => item.status).filter(Boolean))],
    [staff],
  );

  const totalPages = Math.ceil(filteredStaff.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedStaff = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredStaff.slice(startIndex, startIndex + pageSize);
  }, [filteredStaff, safeCurrentPage]);

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Staff Management</h2>

          <p className="all-dash-page-subtitle">
            {/* Manage academy support staff and departments. */}
            Manage staff profiles, departments, roles, salaries, and active
            status.
          </p>
        </div>

        {/* {canCreate() && ( */}
        <Button
          className="dashboard-action-primary-btn"
          onClick={handleAddStaff}
        >
          <FiPlus className="dashboard-action-primary-btn-icon" />
          Add Staff
        </Button>
        {/* )} */}
      </div>

      {/* Loader */}
      {isStaffLoading ? (
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
          {/* Statistics */}
          <Row className="g-3 mb-4">
            <Col md={3} xs={6}>
              <StatCard
                title="Total Staff"
                value={statistics.total_staff}
                icon={FiUsers}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Active"
                value={statistics.active_staff}
                icon={FiUserCheck}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Departments"
                value={statistics.total_departments}
                icon={FiBriefcase}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Inactive"
                value={statistics.inactive_staff}
                icon={FiUserX}
              />
            </Col>
          </Row>

          {/* Toolbar */}
          <TableToolbar
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            filters={[
              {
                key: "department",
                label: "Department",
                options: departmentOptions,
              },

              {
                key: "status",
                label: "Status",
                options: statusOptions,
              },
            ]}
            activeFilters={activeFilters}
            setActiveFilters={(value) => {
              setActiveFilters(value);
              setCurrentPage(1);
            }}
            onClear={handleClearFilters}
            data={filteredStaff}
            columns={columns}
            exportFileName="staff"
          />

          <Table
            columns={columns}
            data={paginatedStaff}
            rowKey="staffId"
            actions={(row) => (
              <div className="common-management-action-buttons">
                <button
                  className={`common-management-action-button ${
                    !row.document_urls?.length
                      ? "common-management-action-button-disabled"
                      : ""
                  }`}
                  title={
                    row.document_urls?.length
                      ? "View Documents"
                      : "No Documents"
                  }
                  disabled={!row.document_urls?.length}
                  onClick={() => handleViewStaffDocuments(row)}
                >
                  <FiEye />
                </button>

                {/* {canEdit() && ( */}
                <button title="Edit Staff" onClick={() => handleEditStaff(row)}>
                  <FiEdit2 />
                </button>
                {/* )} */}

                <button
                  title={row.is_active ? "Deactivate Staff" : "Activate Staff"}
                  onClick={() => handleOpenDelete(row)}
                >
                  {row.is_active ? <FiUserX /> : <FiUserCheck />}
                </button>
              </div>
            )}
          />
        </>
      )}

      {filteredStaff.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredStaff.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Drawer */}
      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        title={drawerTitle}
        onSave={handleSaveStaff}
        saveText={
          isCreatingStaff || isUpdatingStaff
            ? editId
              ? "Updating..."
              : "Adding..."
            : editId
              ? "Update Staff"
              : "Add Staff"
        }
        disabled={isCreatingStaff || isUpdatingStaff}
      >
        <h6 className="ui-common-drawer-section-title">Staff Details</h6>

        <FormField
          label="Staff Name"
          name="staffName"
          value={staffData.staffName}
          onChange={handleStaffChange}
          placeholder="Enter staff name"
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Primary Number"
              name="phone"
              value={staffData.phone}
              onChange={handleStaffChange}
              placeholder="10-digit number"
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Secondary Number"
              name="secondaryPhone"
              value={staffData.secondaryPhone}
              onChange={handleStaffChange}
              placeholder="10-digit number"
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Department"
              name="department"
              // type="select"
              value={staffData.department}
              onChange={handleStaffChange}
              // options={DEPARTMENTS}
              placeholder="Enter department"
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Role / Designation"
              name="role"
              value={staffData.role}
              onChange={handleStaffChange}
              placeholder="Enter designation"
              required
            />
          </Col>
        </Row>

        <FormField
          label="Upload Document"
          name="document_urls"
          type="file"
          multiple
          onChange={handleStaffChange}
          accept=".pdf,.jpg,.jpeg,.png"
          required={!editId}
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Salary (₹)"
              name="salary"
              // type="number"
              value={staffData.salary}
              onChange={handleStaffChange}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Join Date"
              name="joinDate"
              type="date"
              value={staffData.joinDate}
              onChange={handleStaffChange}
              required
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Advance Amount (₹)"
              name="advanceAmount"
              value={staffData.advanceAmount}
              onChange={handleStaffChange}
              placeholder="Enter advance amount"
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Advance Date"
              name="advanceDate"
              type="date"
              value={staffData.advanceDate}
              onChange={handleStaffChange}
            />
          </Col>
        </Row>

        <FormField
          label="Remarks"
          name="remarks"
          type="textarea"
          rows={3}
          value={staffData.remarks}
          onChange={handleStaffChange}
          placeholder="Enter remarks (if any)"
        />

        {/* <FormField
          label="Leaves Available"
          name="leavesAvailable"
          type="number"
          value={staffData.leavesAvailable}
          onChange={handleStaffChange}
        /> */}

        <h6 className="ui-common-drawer-section-title">Emergency Contact</h6>
        <Row>
          <Col md={6}>
            <FormField
              label="Contact Name"
              name="contactName"
              value={staffData.contactName}
              onChange={handleStaffChange}
              placeholder="Enter contact name"
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Relation"
              name="relation"
              value={staffData.relation}
              onChange={handleStaffChange}
              placeholder="Father / Mother / Spouse etc."
            />
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <FormField
              label="Contact Phone"
              name="contactPhone"
              value={staffData.contactPhone}
              onChange={handleStaffChange}
              placeholder="10-digit number"
            />
          </Col>
        </Row>
      </CommonDrawer>

      {/* Documents Drawer */}
      <CommonDrawer
        show={showDocuments}
        onClose={() => {
          setShowDocuments(false);
          setSelectedDocuments([]);
        }}
        title="Staff Documents"
        saveText=""
        disabled
      >
        <div className="common-view-documents-list">
          {selectedDocuments.length > 0 ? (
            selectedDocuments.map((url, index) => {
              const rawFileName = decodeURIComponent(
                url.split("/").pop()?.split("?")[0] || `Document ${index + 1}`,
              );

              const fileName = rawFileName.replace(/^\d+_/, "");

              const extension =
                fileName.split(".").pop()?.toUpperCase() || "FILE";

              return (
                <div
                  key={`${url}-${index}`}
                  className="common-view-document-item"
                >
                  {/* Document information */}
                  <div className="common-view-document-info">
                    <div className="common-view-document-icon">
                      <FiFileText />
                    </div>

                    <div className="common-view-document-details">
                      <span className="common-view-document-number">
                        Document {index + 1} · {extension}
                      </span>

                      <span
                        className="common-view-document-name"
                        title={fileName}
                      >
                        {fileName}
                      </span>
                    </div>
                  </div>

                  {/* Open button */}
                  <button
                    type="button"
                    className="common-view-document-open-btn"
                    onClick={() =>
                      window.open(url, "_blank", "noopener,noreferrer")
                    }
                  >
                    <FiExternalLink />
                    Open
                  </button>
                </div>
              );
            })
          ) : (
            <div className="common-view-documents-empty">
              <div className="common-view-documents-empty-icon">
                <FiFileText />
              </div>

              <h6 className="common-view-documents-empty-title">
                No documents available
              </h6>

              <p className="common-view-documents-empty-text">
                This staff member has no uploaded documents.
              </p>
            </div>
          )}
        </div>
      </CommonDrawer>

      {/* Delete Confirmation */}
      {/* <ConfirmDialog
        show={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteId(null);
        }}
        onConfirm={handleDeleteStaff}
        title="Delete Staff"
        message="Are you sure you want to delete this staff member?"
        confirmText={isDeletingStaff ? "Deleting..." : "Delete"}
        disabled={isDeletingStaff}
      /> */}

      <ConfirmDialog
        show={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteId(null);
          setSelectedStaff(null);
        }}
        onConfirm={handleUpdateStaffStatus}
        title={selectedStaff?.is_active ? "Deactivate Staff" : "Activate Staff"}
        message={
          selectedStaff?.is_active
            ? "Are you sure you want to deactivate this staff application?"
            : "Are you sure you want to activate this staff application?"
        }
        confirmText={
          isDeletingStaff
            ? "Updating..."
            : selectedStaff?.is_active
              ? "Deactivate"
              : "Activate"
        }
        disabled={isDeletingStaff}
      />
    </div>
  );
};

export default Staff;
