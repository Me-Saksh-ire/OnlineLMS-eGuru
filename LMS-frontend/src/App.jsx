import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/AppContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import StudentDashboard from "./pages/Student/pages/StudentDashboard";
import Certificate from "./pages/Student/pages/Certificate";
import TeacherDashboard from "./pages/Teacher/pages/TeacherDashboard";
import VideoPlayer from "./pages/VideoPlayer";
import Cart from "./pages/Cart";
import PurchaseHistory from "./pages/PurchaseHistory";
import Login from "./pages/Login";
import MyCourses from "./pages/MyCourses";
import "./App.css";
import ManageLessons from "./pages/Teacher/pages/ManageLessons";
import CreateCourse from "./pages/Teacher/pages/CreateCourse";
import EditCourse from "./pages/Teacher/pages/EditCourse";
import ProfilePage from "./pages/ProfilePage";

// Separate inner component so it can call useAppContext (must be inside AppProvider)
function AppRoutes() {
  const { user } = useAppContext();
  const [cartItems, setCartItems] = useState([]);

  return (
    <div className="App">
      <Toaster />
      <Navbar cartCount={cartItems.length} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CourseList />} />
        <Route
          path="/course/:id"
          element={
            <CourseDetail
              user={user}
              setCartItems={setCartItems}
              cartItems={cartItems}
            />
          }
        />
        <Route
          path="/student-dashboard"
          element={<StudentDashboard user={user} />}
        />
        <Route path="/certificate/:courseId" element={<Certificate />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/edit-course/:courseId" element={<EditCourse />} />
        <Route
          path="/teacher/course/:courseId/lessons"
          element={<ManageLessons />}
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route
          path="/video/:courseId/:videoId"
          element={<VideoPlayer user={user} />}
        />
        <Route
          path="/cart"
          element={<Cart cartItems={cartItems} setCartItems={setCartItems} />}
        />
        <Route
          path="/purchase-history"
          element={<PurchaseHistory user={user} />}
        />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
