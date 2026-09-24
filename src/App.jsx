import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

import SignIn from "./components/SignIn/SignIn";
import AppLayout from "./layouts/AppLayout";

import Dashboard from "./components/Dashboard/Dashboard";
import Player from "./components/Player/Player";
import PlayerProfile from "./components/PlayerProfile/PlayerProfile";
import Trainer from "./components/Trainer/Trainer";
import Staff from "./components/Staff/Staff";
// import RegularBatch from "./components/RegularBatch/RegularBatch";
import OneOnOne from "./components/OneOnOne/OneOnOne";
import OneOnOneProfile from "./components/OneOnOneProfile/OneOnOneProfile";
import Attendance from "./components/Attendance/Attendance";
import AttendanceProfile from "./components/AttendanceProfile/AttendanceProfile";
import Fees from "./components/Fees/Fees";
import FeeProfile from "./components/FeeProfile/FeeProfile";
import Salary from "./components/Salary/Salary";
import SalaryProfile from "./components/SalaryProfile/SalaryProfile";
import GroundBooking from "./components/GroundBooking/GroundBooking";
// import Events from "./components/Events/Events";
// import Equipment from "./components/Equipment/Equipment";
import Expenditure from "./components/Expenditure/Expenditure";
import Reports from "./components/Reports/Reports";
import Registration from "./components/Registration/Registration";
// import Announcement from "./components/Announcement/Announcement";
import Notification from "./components/Notification/Notification";
import Profile from "./components/Profile/Profile";

import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "./components/NotFound/NotFound";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/signin" replace />} />

        {/* Login */}
        <Route path="/signin" element={<SignIn />} />

        {/* ADMIN & PRIMARY ROUTES */}
        <Route
          path="/management"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* ADMIN + PRIMARY */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="player-management"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <Player />
              </ProtectedRoute>
            }
          />

          <Route
            path="player-management-profile/:playerId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <PlayerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="trainer-management"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Trainer />
              </ProtectedRoute>
            }
          />

          <Route
            path="staff-management"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Staff />
              </ProtectedRoute>
            }
          />
          {/* <Route path="regular-batch" element={<RegularBatch />} /> */}

          <Route
            path="personal-training"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <OneOnOne />
              </ProtectedRoute>
            }
          />

          <Route
            path="one-on-one-profile/:playerId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <OneOnOneProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="attendance"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="attendance-profile/:employeeId/:employeeType"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <AttendanceProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="fee-renewals"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <Fees />
              </ProtectedRoute>
            }
          />

          <Route
            path="fee-profile/:playerId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <FeeProfile />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ONLY */}
          <Route
            path="salary-management"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Salary />
              </ProtectedRoute>
            }
          />

          <Route
            path="salary-profile/:employeeId/:employeeType"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <SalaryProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="ground-booking"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <GroundBooking />
              </ProtectedRoute>
            }
          />
          {/* <Route path="event-management" element={<Events />} /> */}
          {/* <Route path="equipment-management" element={<Equipment />} /> */}

          <Route
            path="expenditure-management"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Expenditure />
              </ProtectedRoute>
            }
          />

          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="registration"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Registration />
              </ProtectedRoute>
            }
          />
          {/* <Route path="announcements" element={<Announcement />} /> */}

          <Route
            path="notifications"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "PRIMARY"]}>
                <Notification />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={["PRIMARY"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="not-found" element={<NotFound />} />
          {/* Catch all wrong student routes */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
