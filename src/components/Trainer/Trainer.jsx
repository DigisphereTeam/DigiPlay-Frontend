import { useMemo, useState, useEffect, useCallback } from "react";
import { Row, Col, Button } from "react-bootstrap";

import {
  FiUsers,
  FiUserCheck,
  FiAward,
  FiUserX,
  FiEdit2,
  // FiTrash2,
  FiPlus,
  FiEye,
  FiFileText,
  FiExternalLink,
} from "react-icons/fi";

import {
  getTrainers,
  createTrainer,
  updateTrainer,
  updateTrainerStatus,
} from "../../services/trainerService";
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

import "./Trainer.css";

const Trainer = () => {
  const [trainers, setTrainers] = useState([]);
  const [statistics, setStatistics] = useState({});

  const emptyTrainer = {
    trainerName: "",
    phone: "",
    secondaryPhone: "",

    specialization: "Batting Coach",
    experienceYears: "",
    baseSalary: "",
    joinDate: "",
    // rating: "",

    advanceAmount: "",
    advanceDate: "",
    remarks: "",

    contactName: "",
    relation: "",
    contactPhone: "",

    document_urls: [],
  };

  const [trainer, setTrainer] = useState(emptyTrainer);

  const [editId, setEditId] = useState(null);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [drawerTitle, setDrawerTitle] = useState("Add New Trainer");
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  //loading
  const [isTrainersLoading, setIsTrainersLoading] = useState(true);
  const [isCreatingTrainer, setIsCreatingTrainer] = useState(false);
  const [isUpdatingTrainer, setIsUpdatingTrainer] = useState(false);
  const [isDeletingTrainer, setIsDeletingTrainer] = useState(false);

  const pageSize = 5;

  const handleTrainerChange = (e) => {
    const { name, value, type, files } = e.target;

    setTrainer((prev) => ({
      ...prev,
      [name]: type === "file" ? Array.from(files) : value,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: "Trainer",
        accessor: "full_name",
        cell: (row) => (
          <div className="common-management-name-cell">
            <div className="common-management-avatar">
              {initialsFromName(row.full_name)}
            </div>

            <div>
              <h6
                className="common-management-table-name"
                title={row.full_name || "-"}
              >
                {row.full_name || "-"}
              </h6>
              <span>{row.coach_code || "-"}</span>
            </div>
          </div>
        ),
      },
      {
        header: "Specialization",
        accessor: "specialization",
        cell: (row) => row.specialization || "-",
      },
      {
        header: "Experience",
        accessor: "experience",
        cell: (row) => `${row.experience} yrs`,
      },
      {
        header: "Primary Phone",
        accessor: "phone_number",
      },

      {
        header: "Secondary Phone",
        accessor: "secondary_phone_number",
        cell: (row) => row.secondary_phone_number || "-",
      },

      {
        header: "Salary",
        accessor: "salary",
        cell: (row) => `₹${Number(row.salary || 0).toLocaleString("en-IN")}`,
      },

      {
        header: "Join Date",
        accessor: "join_date",
        cell: (row) => row.join_date || "-",
      },

      {
        header: "Advance",
        accessor: "advance_amount",
        cell: (row) =>
          `₹${Number(row.advance_amount || 0).toLocaleString("en-IN")}`,
      },

      {
        header: "Advance Date",
        accessor: "advance_date",
        cell: (row) => row.advance_date || "-",
      },

      {
        header: "Contact Name",
        accessor: "contact_name",
        cell: (row) => row.contact_name || "-",
      },

      {
        header: "Contact Relation",
        accessor: "contact_relation",
        cell: (row) => row.contact_relation || "-",
      },

      {
        header: "Contact Phone",
        accessor: "contact_phone",
        cell: (row) => row.contact_phone || "-",
      },

      {
        header: "Remarks",
        accessor: "remarks",
        cell: (row) => <DescriptionCell text={row.remarks || "-"} />,
      },

      {
        header: "Status",
        accessor: "is_active",
        cell: (row) => (
          <span
            className={
              row.is_active
                ? "common-management-table-status-success"
                : "common-management-table-status-danger"
            }
          >
            {row.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    [],
  );

  // Open Add Drawer
  const handleAddTrainer = () => {
    setTrainer({ ...emptyTrainer });
    setEditId(null);
    setDrawerTitle("Add New Trainer");
    setShowDrawer(true);
  };

  // Open Edit Drawer
  const handleEditTrainer = (row) => {
    setTrainer({
      trainerName: row.full_name || "",
      phone: row.phone_number || "",
      secondaryPhone: row.secondary_phone_number || "",

      specialization: row.specialization,
      experienceYears: row.experience ?? "",
      baseSalary: row.salary ?? "",
      joinDate: row.join_date,

      advanceAmount: row.advance_amount ?? "",
      advanceDate: row.advance_date || "",
      remarks: row.remarks || "",

      contactName: row.contact_name || "",
      relation: row.contact_relation || "",
      contactPhone: row.contact_phone || "",

      // rating: row.rating,
      document_urls: [],
    });

    setEditId(row.coach_id);
    setDrawerTitle("Edit Trainer");
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditId(null);
    setTrainer({ ...emptyTrainer });
  };

  const fetchTrainersData = useCallback(async () => {
    try {
      const response = await getTrainers();

      if (response.statusCode === 200) {
        setTrainers(response.data.coaches || []);
        setStatistics(response.data.statistics || {});
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Trainer Error:", error);
      toast.error(error.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    const loadTrainers = async () => {
      setIsTrainersLoading(true);

      try {
        await fetchTrainersData();
      } finally {
        setIsTrainersLoading(false);
      }
    };

    loadTrainers();
  }, [fetchTrainersData]);

  // Save / Submit Function (Add & Edit) API
  const handleSaveTrainer = async (e) => {
    e.preventDefault();

    if (
      !trainer.trainerName ||
      !trainer.phone ||
      !trainer.experienceYears ||
      !trainer.baseSalary ||
      !trainer.joinDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(trainer.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (trainer.secondaryPhone && !phoneRegex.test(trainer.secondaryPhone)) {
      toast.error("Please enter a valid 10-digit secondary phone number");
      return;
    }

    if (trainer.contactPhone && !phoneRegex.test(trainer.contactPhone)) {
      toast.error("Please enter a valid 10-digit emergency contact number");
      return;
    }

    // const payload = {
    //   full_name: trainer.trainerName,
    //   phone_number: trainer.phone,
    //   specialization: trainer.specialization,
    //   experience: Number(trainer.experienceYears),
    //   salary: Number(trainer.baseSalary),
    //   join_date: trainer.joinDate,
    // };

    const formData = new FormData();

    const experience = Number(
      String(trainer.experienceYears).replace(/[^0-9.]/g, ""),
    );

    const salary = Number(String(trainer.baseSalary).replace(/[^0-9.]/g, ""));

    const advanceAmount =
      trainer.advanceAmount === ""
        ? ""
        : Number(String(trainer.advanceAmount).replace(/[^0-9.]/g, ""));

    formData.append("full_name", trainer.trainerName);
    formData.append("phone_number", trainer.phone);
    formData.append("secondary_phone_number", trainer.secondaryPhone || "");

    formData.append("specialization", trainer.specialization);

    formData.append("experience", experience);
    formData.append("salary", salary);

    formData.append("join_date", trainer.joinDate);

    // Advance details
    formData.append("advance_amount", advanceAmount);
    formData.append("advance_date", trainer.advanceDate || "");
    formData.append("remarks", trainer.remarks || "");

    // Emergency contact
    formData.append("contact_name", trainer.contactName || "");
    formData.append("contact_relation", trainer.relation || "");
    formData.append("contact_phone", trainer.contactPhone || "");

    // Add multiple documents using the SAME field name
    if (trainer.document_urls?.length > 0) {
      trainer.document_urls.forEach((file) => {
        formData.append("document_urls", file);
      });
    }

    if (editId) {
      await handleUpdateTrainer(formData);
    } else {
      await handleCreateTrainer(formData);
    }
  };

  // Create Trainer API
  const handleCreateTrainer = async (formData) => {
    setIsCreatingTrainer(true);

    try {
      const response = await createTrainer(formData);

      if (response.statusCode === 201) {
        toast.success(response.message);

        await fetchTrainersData();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create Trainer Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsCreatingTrainer(false);
    }
  };

  const handleUpdateTrainer = async (formData) => {
    setIsUpdatingTrainer(true);

    try {
      const response = await updateTrainer(editId, formData);

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchTrainersData();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update Trainer Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsUpdatingTrainer(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (row) => {
    setSelectedTrainer(row);
    setDeleteId(row.coach_id);
    setShowConfirm(true);
  };

  // Update Trainer Status API
  const handleUpdateTrainerStatus = async () => {
    if (!deleteId) return;

    setIsDeletingTrainer(true);
    try {
      const response = await updateTrainerStatus(
        deleteId,
        !selectedTrainer.is_active,
      );

      if (
        response.success &&
        (response.statusCode === 200 || response.statusCode === 204)
      ) {
        toast.success(
          response.message ||
            (selectedTrainer.is_active
              ? "Trainer deactivated successfully"
              : "Trainer activated successfully"),
        );

        await fetchTrainersData();

        setShowConfirm(false);
        setDeleteId(null);
        setSelectedTrainer(null);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Status Update Error:", error);

      toast.error(error?.response?.data?.message);
    } finally {
      setIsDeletingTrainer(false);
    }
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const handleViewTrainerDocuments = (row) => {
    const documents = row.document_urls || [];

    if (documents.length === 0) {
      toast.error("No documents available for this trainer");
      return;
    }

    setSelectedDocuments(documents);
    setShowDocuments(true);
  };

  const filteredTrainers = useMemo(() => {
    return trainers.filter((trainerItem) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        trainerItem.full_name?.toLowerCase().includes(searchValue) ||
        trainerItem.coach_code?.toLowerCase().includes(searchValue) ||
        trainerItem.phone_number?.toLowerCase().includes(searchValue) ||
        trainerItem.specialization?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;
          return trainerItem[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [trainers, search, activeFilters]);

  const specializationOptions = useMemo(
    () => [...new Set(trainers.map((t) => t.specialization).filter(Boolean))],
    [trainers],
  );
  const totalPages = Math.ceil(filteredTrainers.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedTrainers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredTrainers.slice(startIndex, startIndex + pageSize);
  }, [filteredTrainers, safeCurrentPage]);

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Trainer Management</h2>
          <p className="all-dash-page-subtitle">
            {/* Manage academy trainers and coaching staff. */}
            Manage trainer profiles, trainer details, salaries, and active
            status.
          </p>
        </div>

        {/* {canCreate() && ( */}
        <Button
          className="dashboard-action-primary-btn"
          onClick={handleAddTrainer}
        >
          <FiPlus className="dashboard-action-primary-btn-icon" />
          Add Trainer
        </Button>
        {/* )} */}
      </div>

      {/* Loader */}
      {isTrainersLoading ? (
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
          {/* Statistics Header*/}
          <Row className="g-3 mb-4">
            <Col md={3} xs={6}>
              <StatCard
                title="Total Trainers"
                value={statistics.total_trainers}
                icon={FiUsers}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Active"
                value={statistics.active_trainers}
                icon={FiUserCheck}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="Avg Experience"
                value={
                  statistics.average_experience !== undefined &&
                  statistics.average_experience !== null
                    ? `${statistics.average_experience} yrs`
                    : "-"
                }
                icon={FiAward}
              />
            </Col>

            <Col md={3} xs={6}>
              <StatCard
                title="In Active"
                value={statistics.inactive_trainers}
                icon={FiUserX}
              />
            </Col>
          </Row>

          <TableToolbar
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            filters={[
              {
                key: "specialization",
                label: "Specialization",
                options: specializationOptions,
              },
            ]}
            activeFilters={activeFilters}
            setActiveFilters={(value) => {
              setActiveFilters(value);
              setCurrentPage(1);
            }}
            onClear={handleClearFilters}
            data={filteredTrainers}
            columns={columns}
            exportFileName="trainers"
          />

          <Table
            columns={columns}
            data={paginatedTrainers}
            rowKey="coach_id"
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
                  onClick={() => handleViewTrainerDocuments(row)}
                >
                  <FiEye />
                </button>

                {/* {canEdit() && ( */}
                <button
                  title="Edit Trainer"
                  onClick={() => handleEditTrainer(row)}
                >
                  <FiEdit2 />
                </button>
                {/* )} */}

                <button
                  title={
                    row.is_active ? "Deactivate Trainer" : "Activate Trainer"
                  }
                  onClick={() => handleOpenDelete(row)}
                >
                  {row.is_active ? <FiUserX /> : <FiUserCheck />}
                </button>
              </div>
            )}
          />
        </>
      )}

      {/* Pagination */}
      {filteredTrainers.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredTrainers.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Drawer */}
      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        onSave={handleSaveTrainer}
        title={drawerTitle}
        saveText={
          isCreatingTrainer || isUpdatingTrainer
            ? editId
              ? "Updating..."
              : "Adding..."
            : editId
              ? "Update Trainer"
              : "Add Trainer"
        }
        disabled={isCreatingTrainer || isUpdatingTrainer}
      >
        <h6 className="ui-common-drawer-section-title">Trainer Details</h6>

        <FormField
          label="Trainer Name"
          name="trainerName"
          value={trainer.trainerName}
          onChange={handleTrainerChange}
          placeholder="Enter trainer name"
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Primary Number"
              name="phone"
              value={trainer.phone}
              onChange={handleTrainerChange}
              placeholder="10-digit number"
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Secondary Number"
              name="secondaryPhone"
              value={trainer.secondaryPhone}
              onChange={handleTrainerChange}
              placeholder="10-digit number"
            />
          </Col>
        </Row>

        <FormField
          label="Specialization"
          name="specialization"
          type="select"
          value={trainer.specialization}
          onChange={handleTrainerChange}
          options={[
            "Batting Coach",
            "Bowling Coach",
            "Wicket Keeping Coach",
            "Fielding Coach",
            "Fitness & Conditioning Coach",
            "All Rounder Coach",
          ]}
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Experience (Years)"
              name="experienceYears"
              // type="number"
              value={trainer.experienceYears}
              onChange={handleTrainerChange}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Salary (₹)"
              name="baseSalary"
              value={trainer.baseSalary}
              onChange={handleTrainerChange}
              required
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Join Date"
              name="joinDate"
              type="date"
              value={trainer.joinDate}
              onChange={handleTrainerChange}
              required
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Upload Document"
              name="document_urls"
              type="file"
              multiple
              onChange={handleTrainerChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required={!editId}
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Advance Amount (₹)"
              name="advanceAmount"
              value={trainer.advanceAmount}
              onChange={handleTrainerChange}
              placeholder="Enter advance amount"
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Advance Date"
              name="advanceDate"
              type="date"
              value={trainer.advanceDate}
              onChange={handleTrainerChange}
            />
          </Col>
        </Row>

        <FormField
          label="Remarks"
          name="remarks"
          type="textarea"
          rows={3}
          value={trainer.remarks}
          onChange={handleTrainerChange}
          placeholder="Enter remarks (if any)"
        />

        <h6 className="ui-common-drawer-section-title">Emergency Contact</h6>
        <Row>
          <Col md={6}>
            <FormField
              label="Contact Name"
              name="contactName"
              value={trainer.contactName}
              onChange={handleTrainerChange}
              placeholder="Enter contact name"
            />
          </Col>

          <Col md={6}>
            <FormField
              label="Relation"
              name="relation"
              value={trainer.relation}
              onChange={handleTrainerChange}
              placeholder="Father / Mother / Spouse etc."
            />
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <FormField
              label="Contact Phone"
              name="contactPhone"
              value={trainer.contactPhone}
              onChange={handleTrainerChange}
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
        title="Trainer Documents"
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
                This trainer has no uploaded documents.
              </p>
            </div>
          )}
        </div>
      </CommonDrawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setDeleteId(null);
          setSelectedTrainer(null);
        }}
        onConfirm={handleUpdateTrainerStatus}
        title={
          selectedTrainer?.is_active ? "Deactivate Trainer" : "Activate Trainer"
        }
        message={
          selectedTrainer?.is_active
            ? "Are you sure you want to deactivate this trainer application?"
            : "Are you sure you want to activate this trainer application?"
        }
        confirmText={
          isDeletingTrainer
            ? "Updating..."
            : selectedTrainer?.is_active
              ? "Deactivate"
              : "Activate"
        }
        disabled={isDeletingTrainer}
      />
    </div>
  );
};

export default Trainer;
