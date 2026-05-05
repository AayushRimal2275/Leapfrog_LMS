// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import MainLayout from "./layout/MainLayout";
// import Courses from "./pages/Courses";
// import CourseDetail from "./pages/CourseDetail";
// import Jobs from "./pages/Jobs";
// import JobDetail from "./pages/JobDetail";
// import Profile from "./pages/Profile";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import PrivateRoute from "./components/PrivateRoute";
// import MyCourses from "./pages/MyCourses";
// import MyApplications from "./pages/MyApplications";
// function App() {
//   return (
//     <BrowserRouter>
//       <MainLayout>
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             }
//           />
//           <Route path="/courses" element={<Courses />} />
//           <Route path="/courses/:id" element={<CourseDetail />} />
//           <Route path="/jobs" element={<Jobs />} />
//           <Route path="/jobs/:id" element={<JobDetail />} />
//           <Route path="/profile" element={<Profile />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/my-courses" element={<MyCourses />} />
//           <Route path="/my-applications" element={<MyApplications />} />
//         </Routes>
//       </MainLayout>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layout/MainLayout";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseLearn from "./pages/CourseLearn";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyCourses from "./pages/MyCourses";
import MyApplications from "./pages/MyApplications";
import Certificates from "./pages/Certificates";
import QuizPage from "./pages/QuizPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e1e2e",
              color: "#cdd6f4",
              border: "1px solid #313244",
              borderRadius: "12px",
            },
            success: {
              iconTheme: { primary: "#a6e3a1", secondary: "#1e1e2e" },
            },
            error: { iconTheme: { primary: "#f38ba8", secondary: "#1e1e2e" } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route
                      path="/courses/:id/learn"
                      element={<CourseLearn />}
                    />
                    <Route path="/courses/:id/quiz" element={<QuizPage />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/jobs/:id" element={<JobDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-courses" element={<MyCourses />} />
                    <Route
                      path="/my-applications"
                      element={<MyApplications />}
                    />
                    <Route path="/certificates" element={<Certificates />} />
                    <Route path="*" element={<Navigate to="/" />} />
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
