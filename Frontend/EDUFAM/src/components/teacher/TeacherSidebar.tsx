import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../Sidebar.css';

export interface TeacherNavItem {
  path: string;
  label: string;
  icon?: string;
  dropdown?: boolean;
  dropdownOptions?: Array<{ value: string; label: string }>;
}

interface TeacherSidebarProps {
  navItems: TeacherNavItem[];
  isOpen: boolean;
  onClassSelect?: (classValue: string) => void;
  selectedClass?: string;
}

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ navItems, isOpen, onClassSelect, selectedClass }) => {
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {navItems.map((item) => {
        if (item.dropdown) {
          return (
            <div key={item.path} className="dropdown sidebar-dropdown mb-2 d-flex flex-column">
              <div className="d-flex align-items-center">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => [
                    "btn btn-link btn-block border-bottom m-0 text-start flex-grow-1",
                    isActive ? "active" : ""
                  ].join(" ")}
                  style={{ fontWeight: 600, fontSize: 16, color: '#0a58ca', borderRadius: 8, padding: '10px 14px', background: '#f8f9fa', border: 'none' }}
                >
                  {item.icon && <i className={`${item.icon} me-2`}></i>}
                  {item.label}
                </NavLink>
                <button
                  className="btn btn-secondary dropdown-toggle ms-2"
                  type="button"
                  id="dashboardDropdownButton"
                  data-bs-toggle="dropdown"
                  aria-expanded={dashboardDropdownOpen}
                  style={{ background: '#f8f9fa', color: '#0a58ca', border: 'none', fontWeight: 600, fontSize: 16, borderRadius: 8, padding: '10px 14px' }}
                  onClick={() => setDashboardDropdownOpen((open) => !open)}
                  tabIndex={0}
                >
                  <span className="visually-hidden">Select class</span>
                </button>
              </div>
              <ul
                className={`dropdown-menu w-100${dashboardDropdownOpen ? ' show' : ''}`}
                aria-labelledby="dashboardDropdownButton"
                style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 4px 16px rgba(30,10,60,0.10)', marginTop: 2, fontSize: 15 }}
              >
                {item.dropdownOptions && item.dropdownOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      className={`dropdown-item${selectedClass === opt.value ? ' active' : ''}`}
                      style={{ color: '#333', fontWeight: 500, borderRadius: 6, background: selectedClass === opt.value ? '#e9ecef' : 'transparent' }}
                      onClick={() => {
                        setDashboardDropdownOpen(false);
                        if (onClassSelect) onClassSelect(opt.value);
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        } else {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "btn btn-link btn-block border-bottom m-0 text-start",
                  isActive ? "active" : ""
                ].join(" ")
              }
              style={{ fontWeight: 500, fontSize: 15, color: '#333', borderRadius: 6, padding: '10px 14px' }}
            >
              {item.icon && <i className={`${item.icon} me-2`}></i>}
              {item.label}
            </NavLink>
          );
        }
      })}
    </div>
  );
};

export default TeacherSidebar;
