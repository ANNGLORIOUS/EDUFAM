import "./App.css";
// import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import CustomNavbar from "./components/Navbar";
import ParentDashboard from "./components/ParentDashboard";
import { AdminDashboard } from "./components/admin";
import TeacherDashboard from "./components/TeacherDashboard";
import Footer from "./components/Footer";
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from "./components/Welcome";
import { ResultsProvider } from './context/ResultsContext';
import { AttendanceProvider } from './context/AttendanceContext';

function App() {
  return (
    <AttendanceProvider>
      <ResultsProvider>
        <div className="flex-grow-1">
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/welcome" replace />} />
              <Route path="/welcome" element={<><CustomNavbar /><Welcome /><Footer /></>} />
              <Route path="/parent/*" element={<ParentDashboard />} />
              <Route path="/teacher" element={<><CustomNavbar /><TeacherDashboard /></>} />
              <Route path="/admin/*" element={<><CustomNavbar /><AdminDashboard /></>} />
            </Routes>
          </main>
        </div>
      </ResultsProvider>
    </AttendanceProvider>
  );
}

export default App;