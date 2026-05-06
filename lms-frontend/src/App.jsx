import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layout/MainLayout";
import PrivateRoute from "./components/PrivateRoute";

// ── Auth ──
import Login from "./pages/Login";
import Register from "./pages/Register";

// ── Customer ──
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseLearn from "./pages/CourseLearn";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Profile from "./pages/Profile";
import MyCourses from "./pages/MyCourses";
import MyApplications from "./pages/MyApplications";
import Certificates from "./pages/Certificates";
import QuizPage from "./pages/QuizPage";

// ── Admin ──
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";

// ── HR ──
import HRDashboard from "./pages/hr/HRDashboard";
import HRJobs from "./pages/hr/HRJobs";
import HRApplications from "./pages/hr/HRApplications";
import HRTalentPool from "./pages/hr/HRTalentPool";
import HRProfile from "./pages/hr/HRProfile";

const toastStyle = {
  style: {
    background: "#1e1e2e",
    color: "#cdd6f4",
    border: "1px solid #313244",
    borderRadius: "12px",
  },
  success: { iconTheme: { primary: "#a6e3a1", secondary: "#1e1e2e" } },
  error: { iconTheme: { primary: "#f38ba8", secondary: "#1e1e2e" } },
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={toastStyle} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Customer routes ── */}
          <Route
            path="/*"
            element={
              <PrivateRoute allowedRoles={["customer"]}>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id/learn" element={<CourseLearn />} />
                    <Route path="/courses/:id/quiz" element={<QuizPage />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-courses" element={<MyCourses />} />
                    <Route path="/my-applications" element={<MyApplications />} />
                    <Route path="/certificates" element={<Certificates />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* ── Admin routes ── */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/courses" element={<AdminCourses />} />
                    <Route path="/users" element={<AdminUsers />} />
                    <Route path="/categories" element={<AdminCategories />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/admin" />} />
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* ── HR routes ── */}
          <Route
            path="/hr/*"
            element={
              <PrivateRoute allowedRoles={["hr"]}>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<HRDashboard />} />
                    <Route path="/jobs" element={<HRJobs />} />
                    <Route path="/applications" element={<HRApplications />} />
                    <Route path="/talent-pool" element={<HRTalentPool />} />
                    <Route path="/profile" element={<HRProfile />} />
                    <Route path="*" element={<Navigate to="/hr" />} />
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;