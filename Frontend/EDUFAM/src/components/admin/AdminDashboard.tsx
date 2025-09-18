import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../admin-sidebar';
import AdminView from './AdminView';
import AccountsView from './AccountsView';
import SettingsView from './SettingsView';
import UsersView from './UsersView';
import ReportsView from './ReportsView';
import CustomNavbar from '../Navbar';
import { useEvents } from '../../context/useEvents';

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use events from context for notifications
  const { events } = useEvents();
  const now = new Date();
  
  // Transform events into notifications for the bell icon
  type Notification = {
    id: number;
    message: string;
    date: string;
    event: string;
    description: string;
    extra: string;
    start: string;
    end: string;
  };
  
  const notifications: Notification[] = events
    .filter((e) => e.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      message: e.title,
      date: e.start.toLocaleDateString(),
      event: e.title,
      description: e.description,
      extra: '',
      start: e.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end: e.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Admin navigation items
  const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: 'bi bi-speedometer2' },
    { path: '/admin/users', label: 'Manage Users', icon: 'bi bi-people' },
    { path: '/admin/accounts', label: 'Accounts & Fees', icon: 'bi bi-wallet2' },
    { path: '/admin/reports', label: 'Reports', icon: 'bi bi-file-earmark-text' },
    { path: '/admin/settings', label: 'Settings', icon: 'bi bi-gear' }
  ];

  return (
    <>
      {/* Add Navbar with notifications for admin */}
      <CustomNavbar notifications={notifications} />
      
      <div className="admin-dashboard">
        {/* Sidebar Toggle Button */}
        <Button
          variant="outline-primary"
          className="mb-3 ms-3"
          onClick={toggleSidebar}
          style={{ position: 'fixed', top: '70px', left: '10px', zIndex: 1025 }}
        >
          {sidebarOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-list"></i>}
        </Button>

      {/* Sidebar */}
      <AdminSidebar navItems={adminNavItems} isOpen={sidebarOpen} />

      {/* Main Content */}
      <div 
        className={`admin-content ${sidebarOpen ? 'sidebar-open' : ''}`}
        style={{
          marginLeft: sidebarOpen ? '250px' : '0',
          transition: 'margin-left 0.3s ease-in-out',
          padding: '20px',
          paddingTop: '100px'
        }}
      >
        <Container fluid>
          <Routes>
            <Route path="/" element={<AdminView />} />
            <Route path="/users" element={<UsersView />} />
            <Route path="/accounts" element={<AccountsView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/settings" element={<SettingsView />} />
          </Routes>
        </Container>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1019,
            display: window.innerWidth <= 768 ? 'block' : 'none'
          }}
        />
      )}
    </div>
    </>
  );
};

export default AdminDashboard;
