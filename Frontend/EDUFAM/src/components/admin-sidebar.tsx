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
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ navItems, isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
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
