import { useState, useMemo } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  LuPackageSearch,
  LuTriangleAlert,
  LuBoxes,
  LuIndianRupee,
} from "react-icons/lu";
import toast from "react-hot-toast";

import StatCard from "../ui/StatCard/StatCard";
import Table from "../ui/Table/Table";
import TableToolbar from "../ui/TableToolbar/TableToolbar";
import TablePagination from "../ui/TablePagination/TablePagination";
import CommonDrawer from "../ui/CommonDrawer/CommonDrawer";
import ConfirmDialog from "../ui/ConfirmDialog/ConfirmDialog";
import FormField from "../ui/FormField/FormField";

const INITIAL_EQUIPMENT = [
  {
    id: "1",
    itemName: "Bowling Machine Balls",
    code: "EQ-3180",
    purchased: 24,
    broken: 0,
    lost: 2,
    issued: 21,
    unitPrice: 350,
    minStockThreshold: 5,
  },
  {
    id: "2",
    itemName: "Batting Pads",
    code: "EQ-3181",
    purchased: 9,
    broken: 0,
    lost: 0,
    issued: 1,
    unitPrice: 2200,
    minStockThreshold: 3,
  },
  {
    id: "3",
    itemName: "Wicket Keeping Pads",
    code: "EQ-3182",
    purchased: 16,
    broken: 0,
    lost: 0,
    issued: 5,
    unitPrice: 2500,
    minStockThreshold: 4,
  },
  {
    id: "4",
    itemName: "Abdomen Guard",
    code: "EQ-3183",
    purchased: 38,
    broken: 0,
    lost: 0,
    issued: 38,
    unitPrice: 250,
    minStockThreshold: 5,
  },
  {
    id: "5",
    itemName: "Arm Guard",
    code: "EQ-3184",
    purchased: 28,
    broken: 0,
    lost: 0,
    issued: 20,
    unitPrice: 450,
    minStockThreshold: 5,
  },
  {
    id: "6",
    itemName: "Wicket Keeping Gloves",
    code: "EQ-3185",
    purchased: 40,
    broken: 0,
    lost: 0,
    issued: 22,
    unitPrice: 1800,
    minStockThreshold: 5,
  },
  {
    id: "7",
    itemName: "Cricket Ball (Tennis)",
    code: "EQ-3186",
    purchased: 23,
    broken: 0,
    lost: 0,
    issued: 7,
    unitPrice: 90,
    minStockThreshold: 10,
  },
  {
    id: "8",
    itemName: "Kit Bag",
    code: "EQ-3188",
    purchased: 32,
    broken: 0,
    lost: 0,
    issued: 18,
    unitPrice: 3200,
    minStockThreshold: 5,
  },
];

const INITIAL_FORM_STATE = {
  itemName: "",
  code: "",
  purchased: 0,
  broken: 0,
  lost: 0,
  issued: 0,
  unitPrice: 0,
  minStockThreshold: 5,
};

const FILTER_CONFIG = [
  {
    key: "status",
    label: "Status",
    options: ["In Stock", "Low Stock"],
  },
];

const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const Equipment = () => {
  const [equipmentList, setEquipmentList] = useState(INITIAL_EQUIPMENT);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 7;

    // Table Columns Setup
  const columns = [
    { header: "Item", accessor: "itemName" },
    { header: "Code", accessor: "code" },
    { header: "Purchased", accessor: "purchased" },
    { header: "Broken", accessor: "broken" },
    {
      header: "Lost",
      accessor: "lost",
      cell: (row) =>
        row.lost > 0 ? (
          <span className="common-management-table-status-warning">
            {row.lost}
          </span>
        ) : (
          0
        ),
    },
    { header: "Issued", accessor: "issued" },
    {
      header: "Available",
      accessor: "available",
      cell: (row) => <strong>{getAvailable(row)}</strong>,
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const available = getAvailable(row);
        const isLow = available <= row.minStockThreshold;
        return (
          <span
            className={
              isLow
                ? "common-management-table-status-warning"
                : "common-management-table-status-success"
            }
          >
            {isLow ? "Low Stock" : "In Stock"}
          </span>
        );
      },
    },
  ];

  const getAvailable = (item) => {
    const avail = item.purchased - (item.broken + item.lost + item.issued);
    return Math.max(0, avail);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Math.max(0, Number(value)) : value,
    }));
  };

  const handleOpenAddDrawer = () => {
    setEditingItem(null);
    setFormData({
      ...INITIAL_FORM_STATE,
      code: `EQ-${Math.floor(3100 + Math.random() * 900)}`,
    });
    setShowDrawer(true);
  };

  const handleOpenEditDrawer = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditingItem(null);
    setFormData(INITIAL_FORM_STATE);
  };

  // Open Delete Confirm Dialog
  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  // Confirm Delete Action & Redirect to previous page if page becomes empty
  const handleDeleteItem = () => {
    const updatedList = equipmentList.filter((item) => item.id !== deleteId);

    // Calculate remaining items based on current search & active filters
    const updatedFiltered = updatedList.filter((item) => {
      const available = getAvailable(item);
      const status =
        available <= item.minStockThreshold ? "Low Stock" : "In Stock";

      const matchesSearch =
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase());

      const selectedStatus = activeFilters.status;
      const matchesStatus =
        !selectedStatus ||
        selectedStatus === "All" ||
        status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    const newTotalPages = Math.ceil(updatedFiltered.length / pageSize);

    // Redirect to previous page if current page exceeds maximum page limit after delete
    if (page > newTotalPages && newTotalPages > 0) {
      setPage(newTotalPages);
    }

    setEquipmentList(updatedList);
    toast.success("Equipment deleted successfully");
    setDeleteId(null);
    setShowConfirm(false);
  };

  const handleSaveEquipment = (e) => {
    e.preventDefault();

    if (!formData.itemName || !formData.code) {
      toast.error("Please fill required equipment details");
      return;
    }

    if (editingItem) {
      setEquipmentList((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? { ...formData, id: editingItem.id }
            : item,
        ),
      );
      toast.success("Equipment updated successfully");
    } else {
      const newItem = {
        ...formData,
        id: Date.now().toString(),
      };
      setEquipmentList((prev) => [newItem, ...prev]);
      toast.success("Equipment added successfully");
    }

    handleCloseDrawer();
  };

  // Clear Toolbar Filters
  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setPage(1);
  };

  // Dynamic Calculated Metrics for StatCards
  const lowStockCount = useMemo(() => {
    return equipmentList.filter((item) => {
      const available =
        (item.purchased || 0) -
        ((item.broken || 0) + (item.lost || 0) + (item.issued || 0));
      return available <= (item.minStockThreshold || 0);
    }).length;
  }, [equipmentList]);

  const totalUnits = useMemo(() => {
    return equipmentList.reduce((acc, item) => {
      const available =
        (item.purchased || 0) -
        ((item.broken || 0) + (item.lost || 0) + (item.issued || 0));
      return acc + Math.max(0, available);
    }, 0);
  }, [equipmentList]);

  const totalValue = useMemo(() => {
    return equipmentList.reduce((acc, item) => {
      const available =
        (item.purchased || 0) -
        ((item.broken || 0) + (item.lost || 0) + (item.issued || 0));
      return acc + Math.max(0, available) * (item.unitPrice || 0);
    }, 0);
  }, [equipmentList]);

  // Filtered Data based on Search and Toolbar status selection
  const filteredData = useMemo(() => {
    return equipmentList.filter((item) => {
      const available = getAvailable(item);
      const status =
        available <= item.minStockThreshold ? "Low Stock" : "In Stock";

      const matchesSearch =
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase());

      const selectedStatus = activeFilters.status;
      const matchesStatus =
        !selectedStatus ||
        selectedStatus === "All" ||
        status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [equipmentList, search, activeFilters]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const safeCurrentPage = page > totalPages ? totalPages || 1 : page;

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safeCurrentPage, pageSize]);



  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Equipment Management</h2>
          <p className="all-dash-page-subtitle">
            Purchase, issue, return, and track inventory across the academy
          </p>
        </div>

        <Button
          className="dashboard-action-primary-btn"
          onClick={handleOpenAddDrawer}
        >
          <FiPlus className="dashboard-action-primary-btn-icon" />
          Add Equipment
        </Button>
      </div>

      {/* Dynamic Stats Cards */}
      <Row className="g-3 mb-4">
        <Col lg={3} md={6} xs={6}>
          <StatCard
            title="Total Items Tracked"
            value={equipmentList.length}
            icon={LuPackageSearch}
          />
        </Col>

        <Col lg={3} md={6} xs={6}>
          <StatCard
            title="Low Stock Alerts"
            value={lowStockCount}
            icon={LuTriangleAlert}
          />
        </Col>

        <Col lg={3} md={6} xs={6}>
          <StatCard
            title="Units in Inventory"
            value={totalUnits}
            icon={LuBoxes}
          />
        </Col>

        <Col lg={3} md={6} xs={6}>
          <StatCard
            title="Inventory Value"
            value={formatINR(totalValue)}
            icon={LuIndianRupee}
          />
        </Col>
      </Row>

      {/* Table Section with Toolbar */}
      <TableToolbar
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        filters={FILTER_CONFIG}
        activeFilters={activeFilters}
        setActiveFilters={(val) => {
          setActiveFilters(val);
          setPage(1);
        }}
        onClear={handleClearFilters}
        data={filteredData}
        columns={columns}
        exportFileName="equipment-inventory"
      />

      <Table
        columns={columns}
        data={paginatedData}
        actions={(row) => (
          <div className="common-management-action-buttons">
            <button title="Edit Item" onClick={() => handleOpenEditDrawer(row)}>
              <FiEdit2 />
            </button>
            <button
              title="Delete Item"
              onClick={() => handleOpenDelete(row.id)}
            >
              <FiTrash2 />
            </button>
          </div>
        )}
      />

      {filteredData.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredData.length}
          pageSize={pageSize}
          onPrevious={() => setPage((prev) => prev - 1)}
          onNext={() => setPage((prev) => prev + 1)}
        />
      )}

      {/* Slide-out Drawer */}
      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        title={editingItem ? "Edit Equipment Item" : "Add New Equipment"}
        onSave={handleSaveEquipment}
        saveText={editingItem ? "Update Item" : "Save Item"}
      >
        <h6 className="ui-common-drawer-section-title">Equipment Details</h6>

        <FormField
          label="Item Name"
          name="itemName"
          value={formData.itemName}
          onChange={handleInputChange}
          placeholder="e.g. Bowling Machine Balls"
          required
        />

        <Row>
          <Col md={6}>
            <FormField
              label="Equipment Code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g. EQ-3180"
              required
            />
          </Col>
          <Col md={6}>
            <FormField
              label="Unit Price (₹)"
              name="unitPrice"
              type="number"
              value={formData.unitPrice}
              onChange={handleInputChange}
              required
            />
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormField
              label="Purchased Quantity"
              name="purchased"
              type="number"
              value={formData.purchased}
              onChange={handleInputChange}
              required
            />
          </Col>
          <Col md={6}>
            <FormField
              label="Low Stock Threshold"
              name="minStockThreshold"
              type="number"
              value={formData.minStockThreshold}
              onChange={handleInputChange}
            />
          </Col>
        </Row>

        <Row>
          <Col md={4}>
            <FormField
              label="Broken"
              name="broken"
              type="number"
              value={formData.broken}
              onChange={handleInputChange}
            />
          </Col>
          <Col md={4}>
            <FormField
              label="Lost"
              name="lost"
              type="number"
              value={formData.lost}
              onChange={handleInputChange}
            />
          </Col>
          <Col md={4}>
            <FormField
              label="Issued"
              name="issued"
              type="number"
              value={formData.issued}
              onChange={handleInputChange}
            />
          </Col>
        </Row>
      </CommonDrawer>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteItem}
        title="Delete Equipment"
        message="Are you sure you want to delete this equipment item?"
        confirmText="Delete"
      />
    </div>
  );
};

export default Equipment;
