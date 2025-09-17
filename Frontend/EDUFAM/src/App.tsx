import "./App.css";
// import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import CustomNavbar from "./components/Navbar";
import ParentDashboard from "./components/ParentDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import Footer from "./components/Footer";
import { useUser } from "@clerk/clerk-react";
import { Routes, Route } from 'react-router-dom';
import Welcome from "./components/Welcome";
import AdminDashboard from "./components/AdminDashboard";
import Sidebar from "./components/Sidebar";
import { useState } from "react";

function App() {
  const { user } = useUser();
  const teacherEmail = "sandranyambura72@gmail.com";
  const isTeacher = user?.primaryEmailAddress?.emailAddress === teacherEmail;
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <>
      <CustomNavbar toggleSidebar={toggleSidebar} />
      {sidebarVisible && <Sidebar />}
      <div className="flex-grow-1">
        <main>
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/welcome" element={<><Welcome /><Footer /></>} />
            <Route path="/parent-dashboard" element={<><ParentDashboard /><Footer /></>} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          </Routes>
          
          
        </main>
      </div>
    </>
  );
}

export default App;