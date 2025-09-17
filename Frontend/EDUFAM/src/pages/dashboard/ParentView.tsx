import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import React from 'react';
import { Row, Col, Card, Button, Form, ListGroup, Container } from 'react-bootstrap';

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

// Example events array (replace with your real event data)
const bigCalendarEvents = [
  {
    title: 'Maths Contest',
    start: new Date(2025, 8, 22, 10, 0),
    end: new Date(2025, 8, 22, 12, 0),
  },
  {
    title: 'Parents Meeting',
    start: new Date(2025, 8, 25, 14, 0),
    end: new Date(2025, 8, 25, 16, 0),
  },
];

// Helper to get logged-in parent and their child
function getLoggedInParent() {
  // Simulate logged-in parent by email (replace with real auth in production)
  const parentEmail = localStorage.getItem('edufam_logged_in_parent_email');
  if (!parentEmail) return null;
  const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
  return users.find((u: any) => u.type === 'parent' && u.email === parentEmail);
}

function getChildForParent(parent: any) {
  if (!parent || !parent.childId) return null;
  const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
  return users.find((u: any) => u.type === 'student' && u.id === parent.childId);
}

const ParentView: React.FC = () => {
  const parent = getLoggedInParent();
  const childData = getChildForParent(parent) || {
    name: "Demo Child",
    class: "Class 5",
    photo: "https://randomuser.me/api/portraits/lego/1.jpg",
    recentGrades: [],
    attendance: 95
  };

  // Example notifications
  const notifications = [
    {
      id: 1,
      message: "Parent-Teacher Meeting scheduled",
      date: "2025-09-20",
      event: "Parent-Teacher Meeting",
      description: "Join us for a discussion on your child's progress and school updates.",
      extra: "Your presence is highly encouraged to foster better communication.",
      start: "10:00 AM",
      end: "12:00 PM",
      photo: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      message: "Mid-term Exams coming up",
      date: "2025-09-15",
      event: "Mid-term Exams",
      description: "Mid-term exams for all classes. Ensure your child is prepared.",
      extra: "Please check the exam timetable and help your child revise.",
      start: "8:00 AM",
      end: "1:00 PM",
      photo: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      message: "School Holiday announced",
      date: "2025-09-25",
      event: "School Holiday",
      description: "School will be closed for a public holiday. Enjoy your break!",
      extra: "Classes will resume as usual after the holiday.",
      start: "All Day",
      end: "All Day",
      photo: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
    },
  ];

  const handleConfirmAttendance = (event: string) => {
    alert(`Attendance confirmed for: ${event}`);
  };

  const sectionRefs = {
    childProfile: React.useRef<HTMLDivElement>(null),
    fees: React.useRef<HTMLDivElement>(null),
    notifications: React.useRef<HTMLDivElement>(null),
    feedback: React.useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (section: keyof typeof sectionRefs) => {
    const offset = 80; // Height of navbar
    const ref = sectionRefs[section].current;
    if (ref) {
      const top = ref.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Feedback submission handler
  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const concernType = (form.elements.namedItem('concernType') as HTMLSelectElement)?.value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement)?.value;
    const requestCallback = (form.elements.namedItem('requestCallback') as HTMLInputElement)?.checked;
    if (!concernType || !message) return;
    // Save feedback to localStorage
    const feedbacks = JSON.parse(localStorage.getItem('edufam_feedbacks') || '[]');
    feedbacks.push({
      concernType,
      message,
      requestCallback,
      date: new Date().toISOString(),
      from: childData.name,
      class: childData.class
    });
    localStorage.setItem('edufam_feedbacks', JSON.stringify(feedbacks));
    alert('Feedback sent to teacher!');
    form.reset();
  };

  return (
    <Container fluid className="py-4">
      <Row className="parent-dashboard-row g-0">
        <Col md={3} className="p-0">
          <ListGroup variant="flush" className="sidebar">
            <ListGroup.Item action onClick={() => scrollToSection('childProfile')}>
              <i className="bi bi-person-badge me-2" style={{ color: '#6c63ff' }}></i> Child Profile
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => scrollToSection('fees')}>
              <i className="bi bi-cash-stack me-2" style={{ color: '#fb7100' }}></i> Fees
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => scrollToSection('notifications')}>
              <i className="bi bi-bell me-2" style={{ color: '#43cea2' }}></i> Notifications
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => scrollToSection('feedback')}>
              <i className="bi bi-chat-left-text me-2" style={{ color: '#a83279' }}></i> Feedback
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={9} style={{ marginLeft: '150px', marginTop: '40px' }}>
          <div style={{ gap: '32px' }}>
            <div style={{ flex: 1 }}>
              <div ref={sectionRefs.childProfile}>
                {/* Child Profile Section */}
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Child Profile</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4} className="text-center">
                        <img
                          src={childData.photo}
                          alt={childData.name}
                          className="rounded-circle mb-3"
                          style={{ width: "120px", height: "120px", objectFit: "cover", border: '3px solid #1e0a3c', background: '#fff' }}
                        />
                        <h4>{childData.name}</h4>
                        <p className="text-muted">{childData.class}</p>
                        <div className="d-flex flex-column gap-2 mt-3">
                          <Button className="modern-action-btn" style={{ width: '100%' }} as="a" href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-chat-dots me-2"></i> Chat with Teacher
                          </Button>
                          <Button className="modern-action-btn" style={{ width: '100%' }} as="a" href="https://wa.me/254711111111" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-people me-2"></i> Group Chat
                          </Button>
                        </div>
                      </Col>
                      <Col md={4}>
                        <h6>Overall Performance</h6>
                        <div style={{ color: '#6c63ff', fontWeight: 500, marginBottom: 8 }}>
                          Term: 3, 2025
                        </div>
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
                          Download PDF
                        </Button>
                      </Col>
                      <Col md={4} className="text-center">
                        <div className="attendance-circle">
                          <h6>Attendance</h6>
                          <div className="percentage">
                            <h3>{childData.attendance}%</h3>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div ref={sectionRefs.fees}>
                {/* Fees Section */}
                <Card className="mb-4 fee-status-card">
                  <Card.Header>
                    <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Fee Status</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <h6>Total Fee</h6>
                        <h4>$5000</h4>
                      </Col>
                      <Col md={4}>
                        <h6>Paid Amount</h6>
                        <h4 className="text-success">$3000</h4>
                      </Col>
                      <Col md={4}>
                        <h6>Due Amount</h6>
                        <h4 className="text-danger">$2000</h4>
                      </Col>
                    </Row>
                    <div className="mt-3">
                      <p>Next payment due: 2025-09-30</p>
                      <Button
                        variant="primary"
                        className="modern-action-btn"
                        style={{ width: '100%' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #6c63ff 0%, #1e0a3c 100%)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #1e0a3c 0%, #6c63ff 100%)')}
                      >
                        Pay Now
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Notifications section */}
      <Row>
        <Col md={12}>
          <div ref={sectionRefs.notifications}>
            <Card className="mb-4" style={{ marginLeft: '150px' }}>
              {/* Recent Notifications */}
              <Card.Header>
                <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Recent Notifications</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {notifications.map((notif) => (
                  <ListGroup.Item
                    key={notif.id}
                    className="d-flex flex-column flex-md-row align-items-md-center"
                    style={{ border: 'none', borderBottom: 'none', marginBottom: '1.2rem', background: 'transparent' }}
                  >
                    <div style={{ minWidth: 80, marginRight: 20, marginBottom: 10 }}>
                      <img
                        src={notif.photo}
                        alt={notif.event}
                        style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 16, boxShadow: '0 2px 8px rgba(30,10,60,0.08)' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: '#1e0a3c' }}>{notif.message}</strong>
                      <div className="text-muted" style={{ fontSize: "0.9em" }}>{notif.date}</div>
                      <div style={{ fontSize: "0.95em", margin: "0.25em 0" }}>{notif.description}</div>
                      <div style={{ fontSize: "0.92em", color: '#555', marginBottom: 2 }}>{notif.extra}</div>
                      <div style={{ fontSize: "0.95em" }}>
                        <span className="fw-bold">Time:</span> {notif.start} - {notif.end}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-2 mt-md-0 modern-action-btn"
                      style={{
                        border: 'none',
                        borderRadius: '20px',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        padding: '0.4rem 1.2rem',
                        boxShadow: '0 2px 8px rgba(30,10,60,0.08)',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #6c63ff 0%, #1e0a3c 100%)')}
                      onMouseOut={e => (e.currentTarget.style.background = 'linear-gradient(90deg, #1e0a3c 0%, #6c63ff 100%)')}
                      onClick={() => handleConfirmAttendance(notif.event)}
                    >
                      Learn More
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Events Calendar section (react-big-calendar) */}
      <Row>
        <Col md={12}>
          <Card className="mb-4" style={{ marginLeft: '150px', background: '#fb7100', border: 'none', boxShadow: '0px 1px 4px rgba(30,10,60,0.1)' }}>
            <Card.Header style={{ background: 'transparent', border: 'none', paddingBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700, letterSpacing: 0.5 }}>Events Calendar</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: 500, background: "#fff", borderRadius: "8px", padding: "16px" }}>
                <Calendar
                  localizer={localizer}
                  events={bigCalendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 400 }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Feedback section */}
      <Row>
        <Col md={12}>
          <div ref={sectionRefs.feedback} style={{ display: 'flex', justifyContent: 'center' }}>
            <Card className="mb-4 feedback-card-gradient" style={{ maxWidth: 420, width: '100%', background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', border: 'none', boxShadow: '0 4px 24px rgba(171,71,188,0.10)' }}>
              <Card.Header style={{ background: 'transparent', border: 'none', paddingBottom: 0 }}>
                <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700, letterSpacing: 0.5 }}>Feedback / Request Meeting</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleFeedbackSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#a83279', fontWeight: 600 }}>Concern Type</Form.Label>
                    <Form.Select name="concernType" style={{ background: '#fff', border: '1.5px solid #a83279', borderRadius: 10, color: '#6c63ff', fontWeight: 500 }}>
                      <option value="">Select concern type...</option>
                      <option value="academic">Academic</option>
                      <option value="behavior">Behavior</option>
                      <option value="health">Health</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#a83279', fontWeight: 600 }}>Message</Form.Label>
                    <Form.Control as="textarea" name="message" rows={3} style={{ background: '#fff', border: '1.5px solid #a83279', borderRadius: 10, color: '#6c63ff', fontWeight: 500 }} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check type="checkbox" name="requestCallback" label="Request Callback" style={{ color: '#a83279', fontWeight: 500 }} />
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
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ParentView;
