import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider, { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import StudentLayout from "./layouts/StudentLayout";

import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ChangePasswordPage from "./pages/ChangePassword";
import DashboardPage from "./pages/Dashboard";
import JobsPage from "./pages/Jobs";
import JobCreatePage from "./pages/JobCreate";
import JobApplyPage from "./pages/JobApply";
import ApplicationsPage from "./pages/Applications";
import ProfilePage from "./pages/Profile";
import ResumePage from "./pages/Resume";
import CompanyCreatePage from "./pages/CompanyCreate";
import StudentImportPage from "./pages/StudentImport";
import ResourcesPage from "./pages/Resources";
import InstituteSettingsPage from "./pages/InstituteSettings";
import AdminStudentsPage from "./pages/AdminStudents";
import AdminCompaniesPage from "./pages/AdminCompanies";
import Footer from "./components/Footer";

function AppRoutes() {
  const { role } = useAuth();
  const layout =
    role === "student" || role === "tpo" || role === "admin"
      ? <StudentLayout />
      : <DashboardLayout />;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {layout}
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/create" element={<JobCreatePage />} />
        <Route path="jobs/:id/apply" element={<JobApplyPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="settings/institute" element={<InstituteSettingsPage />} />
        <Route
          path="drives"
          element={<div className="text-slate-600">Drives list – use API /api/drives/</div>}
        />
        <Route
          path="reports"
          element={
            <div className="text-slate-600">
              Reports – use API /api/reports/admin-dashboard/
            </div>
          }
        />
        <Route
          path="students"
          element={
            <ProtectedRoute allowedRoles={["tpo", "admin"]}>
              <AdminStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="students/import"
          element={
            <ProtectedRoute allowedRoles={["tpo", "admin"]}>
              <StudentImportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="companies"
          element={
            <ProtectedRoute allowedRoles={["tpo", "admin"]}>
              <AdminCompaniesPage />
            </ProtectedRoute>
          }
        />
    
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
          
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

