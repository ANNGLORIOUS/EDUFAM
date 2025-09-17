import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar: React.FC<{ activePage: string; setActivePage: (page: string) => void; }> = ({ activePage, setActivePage }) => {
  const [collapse1, setCollapse1] = useState(false);

  return (
    <div className="sidebar">
      {/* First button only */}
      <section className="mb-3">
        <nav className="navbar bg-light">
          <div className="container-fluid">
            <button className="navbar-toggler first-button" type="button" aria-label="Toggle navigation" onClick={() => setCollapse1(!collapse1)}>
              <div className={`animated-icon1${collapse1 ? ' open' : ''}`}><span></span><span></span><span></span></div>
            </button>
          </div>
        </nav>
        <div className={`collapse${collapse1 ? ' show' : ''}`}>
          <div className="bg-light shadow p-4">
            <button className="btn btn-link btn-block border-bottom m-0" onClick={() => setActivePage('home')}>Home</button>
            <button className="btn btn-link btn-block border-bottom m-0" onClick={() => setActivePage('accounts')}>Accounts</button>
            <button className="btn btn-link btn-block border-bottom m-0" onClick={() => setActivePage('users')}>Manage Users</button>
            <button className="btn btn-link btn-block border-bottom m-0" onClick={() => setActivePage('reports')}>School Reports</button>
            <button className="btn btn-link btn-block m-0" onClick={() => setActivePage('ussd')}>USSD Services</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sidebar;