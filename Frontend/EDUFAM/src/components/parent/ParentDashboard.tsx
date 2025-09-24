import { useEvents } from '../../context/useEvents';
import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import CustomNavbar from '../Navbar';
import Sidebar from '../Sidebar';
import { useResults } from '../../context/ResultsContextHook';
import { useAttendance } from '../../context/AttendanceContextHook';
import { ParentMainDashboard, ChildInformationView, EventCalendarView, FeedbackView } from '.';

const ParentDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { results } = useResults();
  const { attendance } = useAttendance();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Replace this with real auth context or prop in production
  const loggedInParentEmail = "janedoe.parent@email.com";
  // Filter results and attendance for this parent
  const parentResults = results.filter(r => r.parentEmail === loggedInParentEmail);
  const parentAttendance = attendance.filter(a => a.parentEmail === loggedInParentEmail);
  // Show the latest uploaded result if available
  const latestResult = parentResults.length > 0 ? parentResults[parentResults.length - 1] : null;
  const latestAttendance = parentAttendance.length > 0 ? parentAttendance[parentAttendance.length - 1] : null;
  const childData = latestResult ? {
    studentName: latestResult.studentName,
    studentId: latestResult.studentId,
    studentClass: latestResult.studentClass,
    term: latestResult.term,
    fileName: latestResult.fileName,
    fileDataUrl: latestResult.fileDataUrl,
    attendance: latestAttendance ? latestAttendance.attendancePercent : 0,
  } : {
    studentName: 'Jane Doe',
    studentId: '12A',
    studentClass: 'Class 1',
    term: '',
    fileName: '',
    fileDataUrl: '',
    attendance: latestAttendance ? latestAttendance.attendancePercent : 0,
  };

  // Parent navigation items
  const parentNavItems = [
    { path: '/parent', label: 'Dashboard', icon: 'bi bi-house' },
    { path: '/parent/child-info', label: 'Child Information', icon: 'bi bi-person-circle' },
    { path: '/parent/event-calendar', label: 'Event Calendar', icon: 'bi bi-calendar-event' },
    { path: '/parent/feedback', label: 'Feedback', icon: 'bi bi-chat-left-text' },
  ];

  // Use events from context
  const { events } = useEvents();
  const now = new Date();
  type Notification = {
    id: number;
    message: string;
    date: string;
    event: string;
    description: string;
    extra: string;
    start: string;
    end: string;
    photo: string;
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
      photo: '',
    }));

  // Component for the main dashboard content
  // Moved to separate file: ./parent/ParentMainDashboard.tsx

  // Placeholder components for other sidebar routes
  // Moved to separate file: ./parent/ChildInformationView.tsx



  // Moved to separate file: ./parent/FeedbackView.tsx

  return (
    <>
      {/* Add Navbar with notifications for parent */}
      <CustomNavbar notifications={notifications} toggleSidebar={toggleSidebar} />

      <div className="parent-dashboard">
        {/* Mobile Sidebar Toggle Button */}
        {/* <Button
          variant="primary"
          className="toggle-sidebar-btn d-md-none"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-list"></i>}
        </Button> */}
        
        {/* Sidebar Toggle Button for Desktop */}
        {/* <Button
          variant="outline-primary"
          className="mb-3 ms-3 d-none d-md-block"
          onClick={toggleSidebar}
          style={{ position: 'fixed', top: '70px', left: '10px', zIndex: 1025 }}
        >
          {sidebarOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-list"></i>}
        </Button> */}

        {/* Sidebar */}
        <Sidebar 
          navItems={parentNavItems} 
          isOpen={sidebarOpen} 
        />

        {/* Main Content */}
        <div 
          className={`parent-content ${sidebarOpen ? 'sidebar-open' : ''}`}
          style={{
            marginLeft: sidebarOpen ? '250px' : '0',
            transition: 'margin-left 0.3s ease-in-out',
            padding: '20px',
            paddingTop: '100px'
          }}
        >
          <Container fluid>
            <Routes>
              <Route path="/" element={<ParentMainDashboard childData={childData} events={events} />} />
              <Route path="/child-info" element={<ChildInformationView />} />
              <Route path="/event-calendar" element={<EventCalendarView events={events} />} />
              <Route path="/feedback" element={<FeedbackView />} />
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
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1010,
              display: window.innerWidth <= 768 ? 'block' : 'none'
            }}
          />
        )}
      </div>
    </>
  );
};

export default ParentDashboard;