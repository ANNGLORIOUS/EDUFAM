import "./App.css";
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Welcome from "./components/Welcome";

// Import the teacher view components
import ResultsView from "./pages/ResultsView";
import EventsView from "./pages/EventsView";
import AttendanceView from "./pages/AttendanceView";
import FeedbackView from "./pages/FeedbackView";

// We can create dedicated pages for these later
const PlaceholderPage = ({ title }: { title: string }) => <div className="container mt-4"><h2>{title}</h2></div>;

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes that use the main layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<PlaceholderPage title="Accounts" />} />
          <Route path="/users" element={<PlaceholderPage title="Manage Users" />} />
          <Route path="/reports" element={<PlaceholderPage title="School Reports" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="/my-students" element={<PlaceholderPage title="My Students" />} />
          <Route path="/assignments" element={<PlaceholderPage title="Assignments" />} />
          <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
          <Route path="/profile" element={<PlaceholderPage title="Profile" />} />
          <Route path="/my-children" element={<PlaceholderPage title="My Children" />} />
          <Route path="/fees" element={<PlaceholderPage title="Fees" />} />
          
          {/* Teacher-specific routes */}
          <Route path="/results" element={<ResultsView />} />
          <Route path="/events" element={<EventsView />} />
          <Route path="/attendance" element={<AttendanceView />} />
          <Route path="/feedback" element={<FeedbackView />} />
        </Route>

        {/* Standalone routes without the main layout */}
        <Route path="/welcome" element={<Welcome />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
