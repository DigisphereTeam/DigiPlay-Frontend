import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import ScrollToTop from "./components/ui/ScrollToTop/ScrollToTop";

import SignIn from "./pages/SignIn/SignIn";
import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Player from "./pages/Player/Player";
import PlayerProfile from "./pages/PlayerProfile/PlayerProfile";
import Trainer from "./pages/Trainer/Trainer";
import Staff from "./pages/Staff/Staff";
// import RegularBatch from "./pages/RegularBatch/RegularBatch";
import OneOnOne from "./pages/OneOnOne/OneOnOne";
import OneOnOneProfile from "./pages/OneOnOneProfile/OneOnOneProfile";
import Attendance from "./pages/Attendance/Attendance";
import AttendanceProfile from "./pages/AttendanceProfile/AttendanceProfile";
import Fees from "./pages/Fees/Fees";
import FeeProfile from "./pages/FeeProfile/FeeProfile";
import Salary from "./pages/Salary/Salary";
import SalaryProfile from "./pages/SalaryProfile/SalaryProfile";
import GroundBooking from "./pages/GroundBooking/GroundBooking";
// import Events from "./pages/Events/Events";
// import Equipment from "./pages/Equipment/Equipment";
import Expenditure from "./pages/Expenditure/Expenditure";
import Reports from "./pages/Reports/Reports";
import Registration from "./pages/Registration/Registration";
// import Announcement from "./pages/Announcement/Announcement";
import Notification from "./pages/Notification/Notification";
import Profile from "./pages/Profile/Profile";

import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "./components/ui/NotFound/NotFound";

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
