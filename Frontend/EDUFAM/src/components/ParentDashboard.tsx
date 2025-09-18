import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useEvents } from '../context/useEvents';
import React from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';
import CustomNavbar from './Navbar';
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
  // Replace this with real auth context or prop in production
  const loggedInParentEmail = "janedoe.parent@email.com";
  const { results } = useResults();
  const { attendance } = useAttendance();
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
  type SectionKey = 'childProfile' | 'fees' | 'notifications' | 'calendar' | 'feedback';

const sectionRefs = React.useMemo(() => ({
  childProfile: React.createRef<HTMLDivElement>(),
  fees: React.createRef<HTMLDivElement>(),
  notifications: React.createRef<HTMLDivElement>(),
  calendar: React.createRef<HTMLDivElement>(),
  feedback: React.createRef<HTMLDivElement>(),
}), []);

const [activeSection, setActiveSection] = React.useState<SectionKey>('childProfile');

const scrollToSection = (section: SectionKey): void => {
  const offset = 80; // Height of navbar
  const ref = sectionRefs[section].current;
  if (ref) {
    const top = ref.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

React.useEffect(() => {
  const handleScroll = () => {
    const offsets = Object.entries(sectionRefs).map(([key, ref]) => {
      if (ref.current) {
        return { key: key as SectionKey, top: ref.current.getBoundingClientRect().top };
      }
      return { key: key as SectionKey, top: Infinity };
    });
    const visible = offsets.filter(o => o.top < window.innerHeight / 2 && o.top > -200);
    if (visible.length > 0) {
      setActiveSection(visible[0].key);
    }
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [sectionRefs]);

  return (
    <>
      <CustomNavbar notifications={notifications} />
      <Container fluid className="py-4">
  <Row className="parent-dashboard-row g-0">
        <Col md={3} className="p-0">
          <ListGroup variant="flush" className="sidebar" style={{ marginTop: '12px', background: '#43cea2' }}>
            <ListGroup.Item action onClick={() => scrollToSection('childProfile')}>
              <i className="bi bi-person-badge me-2" style={{ color: '#6c63ff' }}></i> Child Profile
            </ListGroup.Item>
            <ListGroup.Item action onClick={() => scrollToSection('fees')}>
              <i className="bi bi-cash-stack me-2" style={{ color: '#fb7100' }}></i> Fees
            </ListGroup.Item>
              <ListGroup.Item action active={activeSection === 'calendar'} onClick={() => scrollToSection('calendar')}>
                <i className="bi bi-calendar-event me-2" style={{ color: '#43cea2' }}></i> Calendar
              </ListGroup.Item>
            <ListGroup.Item action onClick={() => scrollToSection('feedback')}>
              <i className="bi bi-chat-left-text me-2" style={{ color: '#a83279' }}></i> Feedback
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={9} style={{ marginLeft: '150px', marginTop: '50px' }}>
          <div style={{  gap: '32px' }}>
            <div style={{ flex: 1 }}>
              <div ref={sectionRefs.childProfile}>
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

      {/* Notifications section removed: now shown as popup in navbar */}

      {/* Events Calendar section (react-big-calendar) */}
      <Row>
        <Col md={12}>
          <Card className="mb-4" style={{ marginLeft: '150px', background: '#e8ecf1ff', border: 'none', boxShadow: '0px 1px 4px rgba(30,10,60,0.1)' }}>
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
        </Col>
      </Row>

      {/* Feedback section */}
      <Row>
        <Col md={12}>
          <div ref={sectionRefs.feedback}>
            <Card className="mb-4 feedback-card-gradient" style={{ marginLeft: '150px', background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', border: 'none', boxShadow: '0 4px 24px rgba(171,71,188,0.10)' }}>
              {/* Feedback / Request Meeting */}
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
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: '#a83279', fontWeight: 600 }}>Message</Form.Label>
                    <Form.Control as="textarea" rows={3} style={{ background: '#fff', border: '1.5px solid #a83279', borderRadius: 10, color: '#6c63ff', fontWeight: 500 }} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check type="checkbox" label="Request Callback" style={{ color: '#a83279', fontWeight: 500 }} />
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
    </>
  );
};

export default ParentDashboard;