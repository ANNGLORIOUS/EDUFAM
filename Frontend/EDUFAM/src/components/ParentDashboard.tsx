import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useEvents } from '../context/useEvents';
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Badge } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import CustomNavbar from './Navbar';
import Sidebar from './Sidebar';
import { useResults } from '../context/ResultsContextHook';
import AttendancePieChart from './AttendancePieChart';
import { useAttendance } from '../context/AttendanceContextHook';


const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const ParentDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { results } = useResults();
  const { attendance } = useAttendance();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show the latest uploaded result if available
  const latestResult = results.length > 0 ? results[results.length - 1] : null;
  const latestAttendance = attendance.length > 0 ? attendance[attendance.length - 1] : null;
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

  return (
    <>
      {/* Add Navbar with notifications for parent */}
      <CustomNavbar notifications={notifications} />
      
      <div className="parent-dashboard">
        {/* Mobile Sidebar Toggle Button */}
        <Button
          variant="primary"
          className="toggle-sidebar-btn d-md-none"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-list"></i>}
        </Button>
        
        {/* Sidebar Toggle Button for Desktop */}
        <Button
          variant="outline-primary"
          className="mb-3 ms-3 d-none d-md-block"
          onClick={toggleSidebar}
          style={{ position: 'fixed', top: '70px', left: '10px', zIndex: 1025 }}
        >
          {sidebarOpen ? <i className="bi bi-x-lg"></i> : <i className="bi bi-list"></i>}
        </Button>

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
              <Route path="/" element={<ParentMainDashboard />} />
              <Route path="/child-info" element={<ChildInformationView />} />
              <Route path="/event-calendar" element={<EventCalendarView />} />
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

  // Component for the main dashboard content
  function ParentMainDashboard() {
    return (
      <>
        {/* Child Profile Section */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Child Profile</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <h6>Overall Performance</h6>
                <div style={{ color: '#6c63ff', fontWeight: 500, marginBottom: 8 }}>
                  {childData.term ? `Term: ${childData.term.replace(/-/g, ' ').replace(/term(\d)/, 'Term $1').replace('midterm', 'Midterm').replace('endterm', 'End Term')}` : 'No results uploaded yet.'}
                </div>
                {childData.fileName && childData.fileDataUrl && (
                  <a href={childData.fileDataUrl} download={childData.fileName}>
                    <Button
                      variant="primary"
                      style={{
                        background: 'linear-gradient(90deg, #1e0a3c 0%, #6c63ff 100%)',
                        border: 'none',
                        borderRadius: 20,
                        fontWeight: 700,
                        fontSize: '1.08rem',
                        letterSpacing: 0.5,
                        padding: '0.6rem 1.4rem',
                        boxShadow: '0 2px 8px rgba(30,10,60,0.10)',
                        color: '#fff',
                        transition: 'all 0.2s',
                      }}
                    >
                      Download Results
                    </Button>
                  </a>
                )}
              </Col>
              
              <Col md={4} className="text-center">
                <div className="attendance-circle">
                  <h6>Attendance</h6>
                  <AttendancePieChart percent={childData.attendance} />
                  <div className="percentage">
                    <h3>{childData.attendance}%</h3>
                  </div>
                </div>
              </Col>

              <Col md={4} className="text-center">
                <div className="d-flex flex-column gap-2 mt-3">
                  <Button className="modern-action-btn" style={{ width: '100%' }}>
                    <i className="bi bi-chat-dots me-2"></i> Chat with Teacher
                  </Button>
                  <Button className="modern-action-btn" style={{ width: '100%' }}>
                    <i className="bi bi-people me-2"></i> Group Chat
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Fees Section */}
        <Card className="mb-4 fee-status-card">
          <Card.Header>
            <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Fee Status</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <h6>Total Fee</h6>
                <h4>KES 30,000</h4>
              </Col>
              <Col md={4}>
                <h6>Paid Amount</h6>
                <h4 className="text-success">KES 20,000</h4>
              </Col>
              <Col md={4}>
                <h6>Due Amount</h6>
                <h4 className="text-danger">KES 10,000</h4>
              </Col>
            </Row>
            <div className="mt-3">
              <p>Next payment due: 2025-09-30</p>
              <Button
                variant="primary"
                className="modern-action-btn"
                style={{ width: '100%' }}
              >
                Pay Now
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Events Calendar section */}
        <Card className="mb-4" style={{ background: '#cf84c7', border: 'none', boxShadow: '0px 1px 4px rgba(30,10,60,0.1)' }}>
          <Card.Header style={{ background: 'transparent', border: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700, letterSpacing: 0.5 }}>Events Calendar</h5>
          </Card.Header>
          <Card.Body>
            <div style={{ height: 500, background: "#fff", borderRadius: "8px", padding: "16px" }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 400 }}
              />
            </div>
          </Card.Body>
        </Card>
      </>
    );
  }

  // Placeholder components for other sidebar routes
  function ChildInformationView() {
    // Get all users and filter for current parent's children
    const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
    
    // Find current parent
    const currentParent = users.find((user: any) => user.type === 'parent');
    
    // Get children based on parent's children array or find by parent email
    const getParentChildren = () => {
      if (currentParent?.children && currentParent.children.length > 0) {
        // Use parent's children array
        return users.filter((user: any) => 
          user.type === 'student' && currentParent.children.includes(user.studentId)
        );
      } else {
        // Fallback: find students by matching criteria or default students
        return users.filter((user: any) => user.type === 'student').slice(0, 2); // Show first 2 students as demo
      }
    };

    const children = getParentChildren();
    const [selectedChild, setSelectedChild] = useState(children[0] || null);

    // Generate some demo academic data
    const generateAcademicData = () => {
      const subjects = ['Mathematics', 'English', 'Science', 'Social Studies', 'Swahili'];
      return subjects.map(subject => ({
        subject,
        grade: Math.floor(Math.random() * 40 + 60), // Random grade 60-100
        remarks: Math.random() > 0.5 ? 'Excellent' : 'Good progress'
      }));
    };

    const generateAttendanceData = () => {
      return {
        present: Math.floor(Math.random() * 10 + 85), // 85-95% attendance
        absent: Math.floor(Math.random() * 5 + 2),
        late: Math.floor(Math.random() * 3 + 1)
      };
    };

    if (children.length === 0) {
      return (
        <Card>
          <Card.Header><h5>Child Information</h5></Card.Header>
          <Card.Body>
            <div className="text-center py-4">
              <i className="bi bi-person-plus" style={{ fontSize: '3rem', color: '#6c63ff' }}></i>
              <h6 className="mt-3">No Children Found</h6>
              <p>No children are linked to your account. Please contact the school administration.</p>
            </div>
          </Card.Body>
        </Card>
      );
    }

    return (
      <>
        {/* Children Selector */}
        {children.length > 1 && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Select Child</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {children.map((child: any) => (
                  <Col md={6} lg={4} key={child.id} className="mb-3">
                    <Card 
                      className={`child-selector-card ${selectedChild?.id === child.id ? 'selected' : ''}`}
                      style={{ 
                        cursor: 'pointer',
                        border: selectedChild?.id === child.id ? '2px solid #6c63ff' : '1px solid #dee2e6',
                        transform: selectedChild?.id === child.id ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => setSelectedChild(child)}
                    >
                      <Card.Body className="text-center">
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '50%', 
                          backgroundColor: '#6c63ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 10px',
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }}>
                          {child.name?.charAt(0) || 'S'}
                        </div>
                        <h6 className="mb-1">{child.name || 'Student Name'}</h6>
                        <small className="text-muted">ID: {child.studentId || child.id}</small><br />
                        <small className="text-muted">Class: {child.class || 'Class 1'}</small>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Selected Child Details */}
        {selectedChild && (
          <>
            {/* Basic Information */}
            <Card className="mb-4">
              <Card.Header style={{ background: 'linear-gradient(90deg, #6c63ff 0%, #1e0a3c 100%)', color: 'white' }}>
                <h5 className="mb-0">Child Profile - {selectedChild.name || 'Student Name'}</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4} className="text-center">
                    <div style={{ 
                      width: '120px', 
                      height: '120px', 
                      borderRadius: '50%', 
                      backgroundColor: '#6c63ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      color: 'white',
                      fontSize: '3rem',
                      fontWeight: 'bold'
                    }}>
                      {selectedChild.name?.charAt(0) || 'S'}
                    </div>
                    <Badge bg="success" className="mb-2">Active Student</Badge>
                  </Col>
                  <Col md={8}>
                    <Row>
                      <Col md={6}>
                        <h6><i className="bi bi-person me-2"></i>Basic Information</h6>
                        <p><strong>Full Name:</strong> {selectedChild.name || 'Student Name'}</p>
                        <p><strong>Student ID:</strong> {selectedChild.studentId || selectedChild.id}</p>
                        <p><strong>Class:</strong> {selectedChild.class || 'Class 1'}</p>
                        <p><strong>Status:</strong> <Badge bg="success">Active</Badge></p>
                      </Col>
                      <Col md={6}>
                        <h6><i className="bi bi-calendar me-2"></i>School Information</h6>
                        <p><strong>Date Enrolled:</strong> {selectedChild.dateAdded || '2025-01-15'}</p>
                        <p><strong>Academic Year:</strong> 2025</p>
                        <p><strong>Term:</strong> Term 3</p>
                        <p><strong>School:</strong> EDUFAM Academy</p>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Academic Performance */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0"><i className="bi bi-graph-up me-2"></i>Academic Performance</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Grade (%)</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateAcademicData().map((subject, index) => (
                          <tr key={index}>
                            <td>{subject.subject}</td>
                            <td>
                              <Badge bg={subject.grade >= 80 ? 'success' : subject.grade >= 70 ? 'warning' : 'danger'}>
                                {subject.grade}%
                              </Badge>
                            </td>
                            <td>{subject.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <h6>Overall Performance</h6>
                      <div style={{ 
                        width: '100px', 
                        height: '100px', 
                        borderRadius: '50%', 
                        backgroundColor: '#28a745',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 15px',
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}>
                        {Math.floor(Math.random() * 20 + 75)}%
                      </div>
                      <Badge bg="success">Excellent</Badge>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Attendance Overview */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0"><i className="bi bi-calendar-check me-2"></i>Attendance Overview</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {(() => {
                    const attendance = generateAttendanceData();
                    const total = attendance.present + attendance.absent;
                    const percentage = Math.round((attendance.present / total) * 100);
                    
                    return (
                      <>
                        <Col md={3} className="text-center">
                          <div style={{ color: '#28a745' }}>
                            <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
                            <h4>{attendance.present}</h4>
                            <small>Present Days</small>
                          </div>
                        </Col>
                        <Col md={3} className="text-center">
                          <div style={{ color: '#dc3545' }}>
                            <i className="bi bi-x-circle" style={{ fontSize: '2rem' }}></i>
                            <h4>{attendance.absent}</h4>
                            <small>Absent Days</small>
                          </div>
                        </Col>
                        <Col md={3} className="text-center">
                          <div style={{ color: '#ffc107' }}>
                            <i className="bi bi-clock" style={{ fontSize: '2rem' }}></i>
                            <h4>{attendance.late}</h4>
                            <small>Late Arrivals</small>
                          </div>
                        </Col>
                        <Col md={3} className="text-center">
                          <div style={{ color: '#6c63ff' }}>
                            <i className="bi bi-percent" style={{ fontSize: '2rem' }}></i>
                            <h4>{percentage}%</h4>
                            <small>Attendance Rate</small>
                          </div>
                        </Col>
                      </>
                    );
                  })()}
                </Row>
              </Card.Body>
            </Card>

            {/* Contact Information */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0"><i className="bi bi-telephone me-2"></i>Emergency Contacts</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Primary Contact (Parent)</h6>
                    <p><strong>Name:</strong> {currentParent?.name || 'Parent Name'}</p>
                    <p><strong>Email:</strong> {currentParent?.email || 'parent@email.com'}</p>
                    <p><strong>Phone:</strong> +254 700 123 456</p>
                    <p><strong>Relationship:</strong> Parent/Guardian</p>
                  </Col>
                  <Col md={6}>
                    <h6>School Contact</h6>
                    <p><strong>Class Teacher:</strong> Ms. Sandra Nyambura</p>
                    <p><strong>Email:</strong> sandranyambura72@gmail.com</p>
                    <p><strong>Phone:</strong> +254 700 654 321</p>
                    <p><strong>Office Hours:</strong> 8:00 AM - 4:00 PM</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Quick Actions */}
            <Card>
              <Card.Header>
                <h5 className="mb-0"><i className="bi bi-lightning me-2"></i>Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="mb-2">
                    <Button variant="primary" style={{ width: '100%' }}>
                      <i className="bi bi-download me-2"></i>Download Report
                    </Button>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Button variant="success" style={{ width: '100%' }}>
                      <i className="bi bi-chat-dots me-2"></i>Message Teacher
                    </Button>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Button variant="warning" style={{ width: '100%' }}>
                      <i className="bi bi-calendar-event me-2"></i>Schedule Meeting
                    </Button>
                  </Col>
                  <Col md={3} className="mb-2">
                    <Button variant="info" style={{ width: '100%' }}>
                      <i className="bi bi-file-earmark-text me-2"></i>View Full Records
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </>
        )}
      </>
    );
  }

  function EventCalendarView() {
    return (
      <Card>
        <Card.Header><h5>Event Calendar</h5></Card.Header>
        <Card.Body>
          <div style={{ height: 600, background: "#fff", borderRadius: "8px", padding: "16px" }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 550 }}
            />
          </div>
        </Card.Body>
      </Card>
    );
  }

  function FeedbackView() {
    return (
      <Card className="feedback-card-gradient" style={{ background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', border: 'none', boxShadow: '0 4px 24px rgba(171,71,188,0.10)' }}>
        <Card.Header style={{ background: 'transparent', border: 'none', paddingBottom: 0 }}>
          <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700, letterSpacing: 0.5 }}>Feedback / Request Meeting</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); }}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#a83279', fontWeight: 600 }}>Concern Type</Form.Label>
              <Form.Select style={{ background: '#fff', border: '1.5px solid #a83279', borderRadius: 10, color: '#6c63ff', fontWeight: 500 }}>
                <option value="">Select concern type...</option>
                <option value="academic">Academic</option>
                <option value="behavior">Behavior</option>
                <option value="health">Health</option>
                <option value="attendance">Attendance</option>
                <option value="general">General Inquiry</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#a83279', fontWeight: 600 }}>Message</Form.Label>
              <Form.Control as="textarea" rows={4} style={{ background: '#fff', border: '1.5px solid #a83279', borderRadius: 10, color: '#6c63ff', fontWeight: 500 }} placeholder="Please describe your concern or feedback..." />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Request Callback" style={{ color: '#a83279', fontWeight: 500 }} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Schedule Meeting" style={{ color: '#a83279', fontWeight: 500 }} />
            </Form.Group>
            <Button variant="primary" type="submit" style={{
              background: 'linear-gradient(90deg, #a83279 0%, #6c63ff 100%)',
              border: 'none',
              borderRadius: 20,
              fontWeight: 700,
              fontSize: '1.08rem',
              letterSpacing: 0.5,
              padding: '0.6rem 1.4rem',
              boxShadow: '0 2px 8px rgba(171,71,188,0.10)',
              color: '#fff',
              transition: 'all 0.2s',
            }}>
              Submit Feedback
            </Button>
          </Form>
        </Card.Body>
      </Card>
    );
  }
};

export default ParentDashboard;