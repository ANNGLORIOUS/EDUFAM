import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import CustomNavbar from '../components/Navbar';
import Sidebar, { type NavItem } from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { type UserRole } from '../context/AuthContext';

// Define navigation items for each role
const adminNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi bi-grid' },
  { path: '/accounts', label: 'Accounts', icon: 'bi bi-wallet2' },
  { path: '/users', label: 'Manage Users', icon: 'bi bi-people' },
  { path: '/reports', label: 'School Reports', icon: 'bi bi-file-earmark-text' },
  { path: '/settings', label: 'Settings', icon: 'bi bi-gear' },
];

const teacherNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
  { path: '/results', label: 'Results', icon: 'bi bi-file-earmark-bar-graph' },
  { path: '/events', label: 'Events', icon: 'bi bi-calendar-event' },
  { path: '/attendance', label: 'Attendance', icon: 'bi bi-check2-square' },
  { path: '/feedback', label: 'Feedback', icon: 'bi bi-chat-dots' },
];

const parentNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi bi-grid' },
  { path: '/my-children', label: 'My Children', icon: 'bi bi-person-check' },
  { path: '/fees', label: 'Fees', icon: 'bi bi-cash-coin' },
  { path: '/calendar', label: 'Calendar', icon: 'bi bi-calendar' },
  { path: '/profile', label: 'Profile', icon: 'bi bi-person' },
];

const getNavItemsByRole = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'ADMIN':
      return adminNavItems;
    case 'TEACHER':
      return teacherNavItems;
    case 'PARENT':
      return parentNavItems;
    default:
      return []; // Return no items for GUEST or other roles
  }
};

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // useMemo to prevent re-calculating nav items on every render
  const navItems = useMemo(() => {
    if (user?.role) {
      return getNavItemsByRole(user.role);
    }
    return [];
  }, [user]);

  return (
    <>
      <CustomNavbar toggleSidebar={toggleSidebar} />
      <Sidebar navItems={navItems} isOpen={isSidebarOpen} />
      <div className={`main-content flex-grow-1 ${isSidebarOpen ? 'shifted' : ''}`} style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <main style={{ padding: '0', backgroundColor: '#f8f9fa' }}>
          <Outlet /> {/* Page content will be rendered here */}
        </main>
      </div>
    </>
  );
};

export default MainLayout;
