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

// Import the admin view components
import UsersView from "./pages/UsersView";
import ReportsView from "./pages/ReportsView";
import AccountsView from "./pages/AccountsView";
import SettingsView from "./pages/SettingsView";

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

          {/* Admin-specific routes */}
          <Route path="/accounts" element={<AccountsView />} />
          <Route path="/users" element={<UsersView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>

        {/* Standalone routes without the main layout */}
        <Route path="/welcome" element={<Welcome />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
