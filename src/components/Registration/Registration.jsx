import { useEffect, useCallback, useMemo, useState } from "react";
import { Button } from "react-bootstrap";

import {
  //   FiUsers,
  //   FiUserCheck,
  //   FiShield,
  //   FiUserPlus,
  FiPlus,
  FiEye,
  FiEyeOff,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

import {
  createRegistration,
  getRegistration,
  updateRegistration,
  deleteRegistration,
} from "../../services/registrationService";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

// import StatCard from "../../components/ui/StatCard/StatCard";
import CommonDrawer from "../../components/ui/CommonDrawer/CommonDrawer";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import FormField from "../../components/ui/FormField/FormField";
import TableToolbar from "../../components/ui/TableToolbar/TableToolbar";
import Table from "../../components/ui/Table/Table";
import TablePagination from "../../components/ui/TablePagination/TablePagination";

const Registration = () => {
  const [users, setUsers] = useState([]);

  const emptyUser = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    role: "Select Role",
  };

  const [userDataForm, setUserDataForm] = useState(emptyUser);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  //loading
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const pageSize = 5;

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserDataForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const columns = useMemo(
    () => [
      {
        header: "Full Name",
        accessor: "fullName",
      },
      {
        header: "Email",
        accessor: "email",
      },
      {
        header: "Mobile Number",
        accessor: "mobileNumber",
      },
      {
        header: "Role",
        accessor: "role",
        cell: (row) => <span>{row.role}</span>,
      },
    ],
    [],
  );

  // Open Add Drawer
  const handleAddUser = () => {
    setUserDataForm({ ...emptyUser });

    setEditMode(false);
    setSelectedUser(null);

    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordFocused(false);
    setConfirmPasswordFocused(false);

    setShowDrawer(true);
  };

  // Open Edit Drawer
  const handleEditUser = (user) => {
    setUserDataForm({
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      password: "",
      confirmPassword: "",
    });

    setSelectedUser(user);
    setEditMode(true);
    setShowDrawer(true);
  };

  // Close Drawer
  const handleCloseDrawer = () => {
    setShowDrawer(false);

    setUserDataForm({ ...emptyUser });

    setEditMode(false);
    setSelectedUser(null);

    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordFocused(false);
    setConfirmPasswordFocused(false);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await getRegistration();

      if (response.statusCode === 200) {
        const formattedUsers = (response.data || []).map((item) => ({
          userId: item.user_id,
          fullName: item.full_name,
          email: item.email,
          mobileNumber: item.phone_number,
          role: item.role,
        }));

        setUsers(formattedUsers);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Get Users Error:", error);
      toast.error(error.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      setIsUserLoading(true);

      try {
        await fetchUsers();
      } finally {
        setIsUserLoading(false);
      }
    };

    loadUsers();
  }, [fetchUsers]);

  // Submit Add / Update
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (
      !userDataForm.fullName ||
      !userDataForm.email ||
      !userDataForm.mobileNumber
      // !userDataForm.password ||
      // !userDataForm.confirmPassword
    ) {
      toast.error("Please fill all required user details");
      return;
    }

    // Password validation only when entering/changing password
    if (userDataForm.password || userDataForm.confirmPassword) {
      if (userDataForm.password !== userDataForm.confirmPassword) {
        toast.error("Password and Confirm Password do not match");
        return;
      }

      if (userDataForm.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    }

    const payload = {
      full_name: userDataForm.fullName,
      email: userDataForm.email,
      phone_number: userDataForm.mobileNumber,
    };

    // Send password only if user enters a new password
    if (userDataForm.password) {
      payload.password = userDataForm.password;
    }

    if (editMode) {
      await handleUpdateUser(payload);
      return;
    }

    setIsCreatingUser(true);

    try {
      const response = await createRegistration({
        ...payload,
        password: userDataForm.password,
      });

      if (response.statusCode === 201) {
        toast.success(response.message);

        await fetchUsers();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Create Registration Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Update User API
  const handleUpdateUser = async (payload) => {
    if (!selectedUser) return;

    setIsUpdatingUser(true);

    try {
      const response = await updateRegistration(selectedUser.userId, payload);

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchUsers();
        handleCloseDrawer();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Update Registration Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };

  // Delete Trainer
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeletingUser(true);

    try {
      const response = await deleteRegistration(selectedUser.userId);

      if (response.statusCode === 200) {
        toast.success(response.message);

        await fetchUsers();

        setShowConfirm(false);
        setSelectedUser(null);
        setEditMode(false);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Delete User Error:", error);

      toast.error(error.response?.data?.message);
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSearch("");
    setActiveFilters({});
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const searchValue = search.toLowerCase();

      const searchMatch =
        item.fullName?.toLowerCase().includes(searchValue) ||
        item.email?.toLowerCase().includes(searchValue) ||
        item.mobileNumber?.includes(searchValue) ||
        item.role?.toLowerCase().includes(searchValue);

      const filterMatch = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (!value || value === "All") return true;

          return item[key] === value;
        },
      );

      return searchMatch && filterMatch;
    });
  }, [users, search, activeFilters]);

  const roleOptions = useMemo(
    () => [...new Set(users.map((item) => item.role).filter(Boolean))],
    [users],
  );
  
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const safeCurrentPage =
    currentPage > totalPages ? totalPages || 1 : currentPage;

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;

    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, safeCurrentPage]);

  return (
    <div className="common-management-main-section">
      <div className="dashboard-action-page-header">
        <div>
          <h2 className="all-dash-page-title">Registration</h2>
          <p className="all-dash-page-subtitle">Manage primary user registration and account details.</p>
        </div>

        <Button
          className="dashboard-action-primary-btn"
          onClick={handleAddUser}
        >
          <FiPlus className="dashboard-action-primary-btn-icon" />
          Add Primary
        </Button>
      </div>

      {/* <Row className="g-3 mb-4"> */}
      {/* <Col md={3} xs={6}>
          <StatCard title="Total Users" value={users.length} icon={FiUsers} />
        </Col> */}

      {/* <Col md={3} xs={6}>
          <StatCard
            title="Active Users"
            value={primaryCount}
            icon={FiUserCheck}
          />
        </Col> */}

      {/* <Col md={3} xs={6}>
          <StatCard title="ADMIN USERS" value={adminCount} icon={FiShield} />
        </Col> */}

      {/* <Col md={3} xs={6}>
          <StatCard
            title="NEW REGISTRATIONS"
            value={users.length}
            icon={FiUserPlus}
          />
        </Col> */}
      {/* </Row> */}

      {/* Loader */}
      {isUserLoading ? (
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
                key: "role",
                label: "Role",
                options: roleOptions,
              },
            ]}
            activeFilters={activeFilters}
            setActiveFilters={(value) => {
              setActiveFilters(value);
              setCurrentPage(1);
            }}
            onClear={handleClearFilters}
            data={filteredUsers}
            columns={columns}
            exportFileName="users_registration_list"
          />

          {/* User Table */}
          <Table
            columns={columns}
            data={paginatedUsers}
            rowKey="userId"
            actions={(row) => (
              <div className="common-management-action-buttons">
                <button title="Edit User" onClick={() => handleEditUser(row)}>
                  <FiEdit2 />
                </button>

                <button
                  title="Delete User"
                  onClick={() => handleOpenDelete(row)}
                >
                  <FiTrash2 />
                </button>
              </div>
            )}
          />
        </>
      )}

      {/* Pagination Footer */}
      {filteredUsers.length > 0 && (
        <TablePagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalRecords={filteredUsers.length}
          pageSize={pageSize}
          onPrevious={() => setCurrentPage((prev) => prev - 1)}
          onNext={() => setCurrentPage((prev) => prev + 1)}
        />
      )}

      {/* Add User Drawer */}
      <CommonDrawer
        show={showDrawer}
        onClose={handleCloseDrawer}
        title={editMode ? "Edit User" : "Add New User"}
        saveText={
          isCreatingUser || isUpdatingUser
            ? "Saving..."
            : editMode
              ? "Update User"
              : "Register"
        }
        onSave={handleCreateUser}
        disabled={isCreatingUser || isUpdatingUser}
      >
        <h6 className="ui-common-drawer-section-title">User Details</h6>

        <input
          type="text"
          name="fake_username_fill"
          style={{ display: "none" }}
          tabIndex="-1"
        />
        <input
          type="password"
          name="fake_password_fill"
          style={{ display: "none" }}
          tabIndex="-1"
        />

        <FormField
          label="Full Name"
          name="fullName"
          value={userDataForm.fullName}
          onChange={handleUserChange}
          placeholder="Enter full name"
          autoComplete="off"
          required
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          value={userDataForm.email}
          onChange={handleUserChange}
          placeholder="Enter email address"
          autoComplete="new-email-unsupported"
          required
        />

        <FormField
          label="Mobile Number"
          name="mobileNumber"
          type="tel"
          value={userDataForm.mobileNumber}
          onChange={handleUserChange}
          placeholder="Enter 10-digit mobile number"
          autoComplete="off"
          required
        />

        {/* Dynamic Role Selection Field */}
        <FormField
          label="Role"
          name="role"
          type="select"
          value={userDataForm.role}
          onChange={handleUserChange}
          options={[
            {
              label: "Select Role",
              value: "",
            },
            {
              label: "Primary",
              value: "PRIMARY",
            },
          ]}
          required
        />

        <div className="position-relative">
          <FormField
            label="Password"
            name="password"
            type={showPassword ? "text" : passwordFocused ? "password" : "text"}
            value={userDataForm.password}
            onChange={handleUserChange}
            onFocus={() => setPasswordFocused(true)}
            placeholder="Enter password"
            autoComplete="new-password"
            required={!editMode}
          />

          <button
            type="button"
            onClick={() => {
              setPasswordFocused(true);
              setShowPassword((prev) => !prev);
            }}
            style={{
              position: "absolute",
              right: "10px",
              top: "32px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6c757d",
            }}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        <div className="position-relative">
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : confirmPasswordFocused
                  ? "password"
                  : "text"
            }
            value={userDataForm.confirmPassword}
            onChange={handleUserChange}
            onFocus={() => setConfirmPasswordFocused(true)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            required={!editMode}
          />
          <button
            type="button"
            onClick={() => {
              setConfirmPasswordFocused(true);
              setShowConfirmPassword((prev) => !prev);
            }}
            style={{
              position: "absolute",
              right: "10px",
              top: "32px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6c757d",
            }}
          >
            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
      </CommonDrawer>

      <ConfirmDialog
        show={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        confirmText={isDeletingUser ? "Deleting..." : "Delete"}
        disabled={isDeletingUser}
      />
    </div>
  );
};

export default Registration;
