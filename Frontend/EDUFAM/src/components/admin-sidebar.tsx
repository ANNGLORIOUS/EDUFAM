import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

// Define the shape of a navigation item
export interface NavItem {
  path: string;
  label: string;
  icon?: string; // Optional icon class (e.g., 'bi bi-house')
}

// Define the props for the AdminSidebar component
interface AdminSidebarProps {
  navItems: NavItem[];
  isOpen: boolean;
  title?: string; // Optional title for the sidebar
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ navItems, isOpen, title }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {title && (
        <div className="sidebar-title p-3 border-bottom bg-primary text-white">
          <h5 className="mb-0">{title}</h5>
        </div>
      )}
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className="btn btn-link btn-block border-bottom m-0 text-start"
        >
          {item.icon && <i className={`${item.icon} me-2`}></i>}
          {item.label}
        </NavLink>
      ))}
    </div>
  );
};

export default AdminSidebar;
