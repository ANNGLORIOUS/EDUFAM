import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import React, { useState } from 'react';
import { Row, Col, Card, Button, Form, ListGroup, Container, Alert, Badge, Modal } from 'react-bootstrap';

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
  // State management for feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    concernType: '',
    urgency: 'medium',
    subject: '',
    message: '',
    requestCallback: false,
    preferredTime: '',
    contactMethod: 'phone'
  });
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger' | 'warning'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  // Feedback submission handler with validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!feedbackForm.concernType) {
      errors.concernType = 'Please select a concern type';
    }
    if (!feedbackForm.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    if (!feedbackForm.message.trim()) {
      errors.message = 'Message is required';
    }
    if (feedbackForm.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
    if (feedbackForm.requestCallback && !feedbackForm.preferredTime) {
      errors.preferredTime = 'Please specify preferred time for callback';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const showMessage = (message: string, variant: 'success' | 'danger' | 'warning' = 'success') => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showMessage('Please fix the errors below', 'danger');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save feedback to localStorage
      const feedbacks = JSON.parse(localStorage.getItem('edufam_feedbacks') || '[]');
      const newFeedback = {
        id: Date.now(),
        ...feedbackForm,
        parentName: parent?.name || 'Parent',
        childName: childData.name,
        childClass: childData.class,
        status: 'pending',
        priority: feedbackForm.urgency,
        submittedAt: new Date().toISOString(),
        readBy: null,
        response: null
      };
      
      feedbacks.push(newFeedback);
      localStorage.setItem('edufam_feedbacks', JSON.stringify(feedbacks));
      
      showMessage('Feedback submitted successfully! We will get back to you soon.', 'success');
      
      // Reset form
      setFeedbackForm({
        concernType: '',
        urgency: 'medium',
        subject: '',
        message: '',
        requestCallback: false,
        preferredTime: '',
        contactMethod: 'phone'
      });
      
    } catch (error) {
      showMessage('Failed to submit feedback. Please try again.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#dc3545';
      case 'medium': return '#fd7e14';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getConcernTypeIcon = (type: string) => {
    switch (type) {
      case 'academic': return 'bi-book';
      case 'behavior': return 'bi-person-exclamation';
      case 'health': return 'bi-heart-pulse';
      case 'attendance': return 'bi-calendar-check';
      case 'transportation': return 'bi-bus-front';
      case 'other': return 'bi-chat-dots';
      default: return 'bi-question-circle';
    }
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
                {/* Enhanced Child Profile Section */}
                <Card className="mb-4" style={{ 
                  border: 'none', 
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(108, 99, 255, 0.12)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e9ecef',
                    borderBottom: 'none',
                    color: '#1e0a3c',
                    padding: '2rem',
                    position: 'relative',
                    borderRadius: '24px 24px 0 0'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '12px',
                      padding: '0.5rem 1rem'
                    }}>
                      <i className="bi bi-star-fill me-1" style={{ color: '#ffd700' }}></i>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#6c757d' }}>Grade A Student</span>
                    </div>
                    
                    <Row className="align-items-center">
                      <Col md={4} className="text-center text-md-start">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img
                            src={childData.photo}
                            alt={childData.name}
                            className="rounded-circle"
                            style={{ 
                              width: "140px", 
                              height: "140px", 
                              objectFit: "cover", 
                              border: '4px solid #e9ecef',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            background: '#28a745',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            border: '3px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="bi bi-check" style={{ color: 'white', fontSize: '0.8rem' }}></i>
                          </div>
                        </div>
                        <div className="mt-3">
                          <h3 style={{ fontWeight: '700', marginBottom: '0.5rem', color: '#1e0a3c' }}>{childData.name}</h3>
                          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#6c757d' }}>{childData.class}</p>
                          <Badge 
                            style={{ 
                              background: '#f8f9fa', 
                              color: '#6c757d',
                              border: '1px solid #e9ecef',
                              fontSize: '0.85rem',
                              padding: '0.5rem 1rem',
                              borderRadius: '20px'
                            }}
                          >
                            <i className="bi bi-calendar-week me-1"></i>
                            Academic Year 2025
                          </Badge>
                        </div>
                      </Col>
                      <Col md={8}>
                        <Row>
                          <Col md={6}>
                            <div style={{
                              background: '#f8f9fa',
                              border: '1px solid #e9ecef',
                              borderRadius: '16px',
                              padding: '1.5rem',
                              marginBottom: '1rem'
                            }}>
                              <div className="d-flex align-items-center mb-3">
                                <div style={{
                                  background: '#6c63ff',
                                  borderRadius: '12px',
                                  padding: '0.8rem',
                                  marginRight: '1rem',
                                  color: 'white'
                                }}>
                                  <i className="bi bi-graph-up" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <div>
                                  <h6 style={{ margin: 0, color: '#1e0a3c' }}>Overall Performance</h6>
                                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#6c757d' }}>Term 3, 2025</p>
                                </div>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h4 style={{ fontWeight: '700', marginBottom: '0.25rem', color: '#1e0a3c' }}>87.5%</h4>
                                  <small style={{ color: '#6c757d' }}>Average Grade</small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{
                                    background: '#28a745',
                                    borderRadius: '8px',
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: 'white'
                                  }}>
                                    +5.2% ↗
                                  </div>
                                  <small style={{ color: '#6c757d' }}>vs last term</small>
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col md={6}>
                            <div style={{
                              background: '#f8f9fa',
                              border: '1px solid #e9ecef',
                              borderRadius: '16px',
                              padding: '1.5rem',
                              marginBottom: '1rem'
                            }}>
                              <div className="d-flex align-items-center mb-3">
                                <div style={{
                                  background: '#17a2b8',
                                  borderRadius: '12px',
                                  padding: '0.8rem',
                                  marginRight: '1rem',
                                  color: 'white'
                                }}>
                                  <i className="bi bi-calendar-check" style={{ fontSize: '1.5rem' }}></i>
                                </div>
                                <div>
                                  <h6 style={{ margin: 0, color: '#1e0a3c' }}>Attendance Rate</h6>
                                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#6c757d' }}>This Month</p>
                                </div>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h4 style={{ fontWeight: '700', marginBottom: '0.25rem', color: '#1e0a3c' }}>{childData.attendance}%</h4>
                                  <small style={{ color: '#6c757d' }}>18/19 Days</small>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{
                                    background: '#ffc107',
                                    color: '#212529',
                                    borderRadius: '8px',
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                  }}>
                                    1 Absent
                                  </div>
                                  <small style={{ color: '#6c757d' }}>Medical leave</small>
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                  
                  <Card.Body style={{ padding: '2rem' }}>
                    {/* Quick Actions */}
                    <div>
                      <h6 style={{ color: '#1e0a3c', fontWeight: '700', marginBottom: '0.75rem' }}>
                        <i className="bi bi-lightning me-2" style={{ color: '#6c63ff' }}></i>
                        Quick Actions
                      </h6>
                      <Row>
                        <Col md={6}>
                          <Button 
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              padding: '0.5rem 1rem',
                              width: '100%',
                              marginBottom: '0.5rem',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.25)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            as="a" 
                            href="https://wa.me/254700000000" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <i className="bi bi-chat-dots me-2"></i>
                            Chat with Teacher
                          </Button>
                        </Col>
                        <Col md={6}>
                          <Button 
                            variant="outline-secondary"
                            style={{
                              borderColor: '#6c63ff',
                              color: '#6c63ff',
                              borderRadius: '8px',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              padding: '0.5rem 1rem',
                              width: '100%',
                              marginBottom: '0.5rem',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#6c63ff';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#6c63ff';
                            }}
                          >
                            <i className="bi bi-download me-2"></i>
                            Download Report Card
                          </Button>
                        </Col>
                        <Col md={6}>
                          <Button 
                            variant="outline-primary"
                            style={{
                              borderColor: '#6c63ff',
                              color: '#6c63ff',
                              borderRadius: '8px',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              padding: '0.5rem 1rem',
                              width: '100%',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#6c63ff';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#6c63ff';
                            }}
                            as="a" 
                            href="https://wa.me/254711111111" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <i className="bi bi-people me-2"></i>
                            Join Parent Group
                          </Button>
                        </Col>
                        <Col md={6}>
                          <Button 
                            variant="outline-success"
                            style={{
                              borderColor: '#28a745',
                              color: '#28a745',
                              borderRadius: '8px',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              padding: '0.5rem 1rem',
                              width: '100%',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#28a745';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#28a745';
                            }}
                          >
                            <i className="bi bi-calendar-plus me-2"></i>
                            Schedule Meeting
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div ref={sectionRefs.fees}>
                {/* Enhanced Fees Section */}
                <Card className="mb-4" style={{ 
                  border: 'none', 
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(108, 99, 255, 0.12)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e9ecef',
                    borderBottom: 'none',
                    color: '#1e0a3c',
                    padding: '1.25rem',
                    position: 'relative',
                    borderRadius: '24px 24px 0 0'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      padding: '0.3rem 0.7rem'
                    }}>
                      <i className="bi bi-shield-check me-1" style={{ color: '#28a745' }}></i>
                      <span style={{ fontWeight: '600', fontSize: '0.8rem', color: '#6c757d' }}>Secure Payments</span>
                    </div>
                    
                    <Row className="align-items-center">
                      <Col md={8}>
                        <h5 style={{ fontWeight: '700', marginBottom: '0.25rem', color: '#1e0a3c' }}>
                          <i className="bi bi-credit-card me-2" style={{ color: '#6c63ff' }}></i>
                          Fee Management Dashboard
                        </h5>
                        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#6c757d' }}>
                          Track payments, view statements, and manage your child's school fees
                        </p>
                        
                        <Row>
                          <Col md={4}>
                            <div style={{
                              background: '#f8f9fa',
                              border: '1px solid #e9ecef',
                              borderRadius: '8px',
                              padding: '0.75rem',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.25rem' }}>Annual Fee</div>
                              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1e0a3c' }}>$5,000</div>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div style={{
                              background: '#d1edff',
                              border: '1px solid #74c0fc',
                              borderRadius: '8px',
                              padding: '0.75rem',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.8rem', color: '#0c5460', marginBottom: '0.25rem' }}>Paid Amount</div>
                              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0c5460' }}>$3,000</div>
                            </div>
                          </Col>
                          <Col md={4}>
                            <div style={{
                              background: '#fff3cd',
                              border: '1px solid #ffeaa7',
                              borderRadius: '8px',
                              padding: '0.75rem',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.8rem', color: '#856404', marginBottom: '0.25rem' }}>Outstanding</div>
                              <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#856404' }}>$2,000</div>
                            </div>
                          </Col>
                        </Row>
                      </Col>
                      <Col md={4} className="text-center">
                        <div style={{
                          background: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          borderRadius: '12px',
                          padding: '1rem'
                        }}>
                          <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.25rem' }}>Payment Progress</div>
                          <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
                              <circle
                                cx="40"
                                cy="40"
                                r="35"
                                stroke="#e9ecef"
                                strokeWidth="6"
                                fill="transparent"
                              />
                              <circle
                                cx="40"
                                cy="40"
                                r="35"
                                stroke="#28a745"
                                strokeWidth="6"
                                fill="transparent"
                                strokeDasharray={`${(3000/5000) * 220} 220`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div style={{
                              position: 'absolute',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e0a3c' }}>60%</div>
                              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>Completed</div>
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  
                  <Card.Body style={{ padding: '1.5rem' }}>
                    {/* Fee Breakdown */}
                    <div className="mb-3">
                      <h6 style={{ color: '#1e0a3c', fontWeight: '700', marginBottom: '1rem' }}>
                        <i className="bi bi-list-ul me-2" style={{ color: '#6c63ff' }}></i>
                        Fee Breakdown - Academic Year 2025
                      </h6>
                      <Row>
                        {[
                          { item: 'Tuition Fee', amount: 3500, paid: 2100, icon: 'bi-book', color: '#6c63ff' },
                          { item: 'Activity Fee', amount: 800, paid: 500, icon: 'bi-palette', color: '#28a745' },
                          { item: 'Technology Fee', amount: 400, paid: 400, icon: 'bi-laptop', color: '#17a2b8' },
                          { item: 'Transport Fee', amount: 300, paid: 0, icon: 'bi-bus-front', color: '#fd7e14' }
                        ].map((fee, index) => (
                          <Col md={6} key={index} className="mb-2">
                            <div style={{
                              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                              border: '1px solid #e9ecef',
                              borderRadius: '12px',
                              padding: '1rem',
                              height: '100%',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            >
                              <div className="d-flex align-items-center mb-2">
                                <div style={{
                                  background: fee.color,
                                  borderRadius: '8px',
                                  padding: '0.5rem',
                                  marginRight: '0.75rem',
                                  color: 'white'
                                }}>
                                  <i className={fee.icon} style={{ fontSize: '1rem' }}></i>
                                </div>
                                <div>
                                  <h6 style={{ color: '#1e0a3c', fontWeight: '600', margin: 0, fontSize: '0.9rem' }}>
                                    {fee.item}
                                  </h6>
                                  <small style={{ color: '#6c757d' }}>
                                    ${fee.paid} of ${fee.amount}
                                  </small>
                                </div>
                              </div>
                              
                              <div className="mb-1">
                                <div className="d-flex justify-content-between mb-1">
                                  <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>Progress</span>
                                  <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                                    {Math.round((fee.paid / fee.amount) * 100)}%
                                  </span>
                                </div>
                                <div style={{
                                  background: '#e9ecef',
                                  borderRadius: '8px',
                                  height: '6px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    background: fee.paid === fee.amount ? '#28a745' : fee.color,
                                    height: '100%',
                                    width: `${(fee.paid / fee.amount) * 100}%`,
                                    borderRadius: '8px',
                                    transition: 'width 0.5s ease'
                                  }}></div>
                                </div>
                              </div>
                              
                              {fee.paid < fee.amount ? (
                                <div style={{
                                  background: '#fff3cd',
                                  border: '1px solid #ffeaa7',
                                  borderRadius: '6px',
                                  padding: '0.3rem 0.5rem',
                                  fontSize: '0.75rem',
                                  color: '#856404'
                                }}>
                                  <i className="bi bi-exclamation-triangle me-1"></i>
                                  Outstanding: ${fee.amount - fee.paid}
                                </div>
                              ) : (
                                <div style={{
                                  background: '#d1edff',
                                  border: '1px solid #74c0fc',
                                  borderRadius: '6px',
                                  padding: '0.3rem 0.5rem',
                                  fontSize: '0.75rem',
                                  color: '#0c5460'
                                }}>
                                  <i className="bi bi-check-circle me-1"></i>
                                  Fully Paid
                                </div>
                              )}
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>

                    {/* Payment Actions & Due Dates */}
                    <div className="mb-3">
                      <Row>
                        <Col md={8}>
                          <div style={{
                            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                            border: '1px solid #ffeaa7',
                            borderRadius: '8px',
                            padding: '0.75rem'
                          }}>
                            <div className="d-flex align-items-center mb-1">
                              <i className="bi bi-calendar-event me-2" style={{ fontSize: '1rem', color: '#856404' }}></i>
                              <div>
                                <h6 style={{ color: '#856404', fontWeight: '700', margin: 0, fontSize: '0.85rem' }}>
                                  Next Payment Due
                                </h6>
                                <p style={{ color: '#856404', margin: 0, fontSize: '0.8rem' }}>
                                  September 30, 2025 - Transport Fee ($300)
                                </p>
                              </div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#856404' }}>
                              <i className="bi bi-info-circle me-1"></i>
                              Avoid late fees by paying before the due date
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <Button
                            style={{
                              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '600',
                              fontSize: '0.9rem',
                              padding: '0.6rem 1.2rem',
                              width: '100%',
                              height: '100%',
                              boxShadow: '0 3px 12px rgba(40, 167, 69, 0.25)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 5px 18px rgba(40, 167, 69, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 3px 12px rgba(40, 167, 69, 0.25)';
                            }}
                          >
                            <i className="bi bi-credit-card me-2"></i>
                            Pay Now
                          </Button>
                        </Col>
                      </Row>
                    </div>

                    {/* Payment History */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 style={{ color: '#1e0a3c', fontWeight: '700', margin: 0, fontSize: '0.9rem' }}>
                          <i className="bi bi-clock-history me-2" style={{ color: '#6c63ff' }}></i>
                          Recent Payment History
                        </h6>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          style={{ borderRadius: '15px', fontWeight: '600', fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                        >
                          <i className="bi bi-download me-1"></i>
                          Download Statement
                        </Button>
                      </div>
                      
                      <div style={{
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        {[
                          { date: '2025-08-15', amount: 1500, type: 'Tuition Fee', status: 'Completed', method: 'Bank Transfer' },
                          { date: '2025-07-10', amount: 600, type: 'Tuition Fee', status: 'Completed', method: 'Credit Card' },
                          { date: '2025-06-20', amount: 500, type: 'Activity Fee', status: 'Completed', method: 'Mobile Money' }
                        ].map((payment, index) => (
                          <div 
                            key={index}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: index !== 2 ? '1px solid #e9ecef' : 'none',
                              background: index % 2 === 0 ? '#ffffff' : 'transparent'
                            }}
                          >
                            <Row className="align-items-center">
                              <Col md={3}>
                                <div style={{ fontWeight: '600', color: '#1e0a3c', fontSize: '0.85rem' }}>
                                  {new Date(payment.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </div>
                                <small style={{ color: '#6c757d', fontSize: '0.75rem' }}>{payment.method}</small>
                              </Col>
                              <Col md={3}>
                                <div style={{ fontWeight: '600', color: '#1e0a3c', fontSize: '0.85rem' }}>
                                  {payment.type}
                                </div>
                              </Col>
                              <Col md={2}>
                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#28a745' }}>
                                  ${payment.amount}
                                </div>
                              </Col>
                              <Col md={2}>
                                <Badge 
                                  style={{ 
                                    background: '#d1edff', 
                                    color: '#0c5460',
                                    borderRadius: '15px',
                                    padding: '0.3rem 0.7rem',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  <i className="bi bi-check-circle me-1"></i>
                                  {payment.status}
                                </Badge>
                              </Col>
                              <Col md={2} className="text-end">
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm"
                                  style={{ borderRadius: '15px', padding: '0.25rem 0.5rem' }}
                                >
                                  <i className="bi bi-receipt" style={{ fontSize: '0.8rem' }}></i>
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        ))}
                      </div>
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
          <Card className="mb-4" style={{ marginLeft: '150px' }}>
            <Card.Header>
              <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Events Calendar</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: 500 }}>
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

      {/* Enhanced Feedback Section */}
      <Row>
        <Col md={12}>
          <div ref={sectionRefs.feedback}>
            {showAlert && (
              <Alert 
                variant={alertVariant} 
                dismissible 
                onClose={() => setShowAlert(false)}
                className="mx-auto"
                style={{ maxWidth: '600px', marginLeft: '150px' }}
              >
                {alertMessage}
              </Alert>
            )}
            
            <Card 
              className="mb-4" 
              style={{ 
                maxWidth: '700px', 
                margin: '0 auto',
                marginLeft: '150px',
                background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                borderRadius: '20px'
              }}
            >
              <Card.Header 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  border: 'none', 
                  borderRadius: '20px 20px 0 0',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-chat-heart me-3" style={{ fontSize: '1.5rem', color: '#fff' }}></i>
                  <div>
                    <h4 className="mb-0" style={{ color: '#fff', fontWeight: 700 }}>
                      Contact Your Child's Teacher
                    </h4>
                    <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                      Share concerns, request meetings, or provide feedback
                    </p>
                  </div>
                </div>
              </Card.Header>
              
              <Card.Body style={{ background: 'rgba(255, 255, 255, 0.95)', borderRadius: '0 0 20px 20px' }}>
                <Form onSubmit={handleFeedbackSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold" style={{ color: '#4c63d2' }}>
                          <i className={`${getConcernTypeIcon(feedbackForm.concernType)} me-2`}></i>
                          Type of Concern *
                        </Form.Label>
                        <Form.Select 
                          value={feedbackForm.concernType}
                          onChange={(e) => handleFormChange('concernType', e.target.value)}
                          isInvalid={!!formErrors.concernType}
                          style={{ 
                            borderRadius: '12px',
                            border: '2px solid #e9ecef',
                            padding: '12px 16px',
                            fontSize: '0.95rem'
                          }}
                        >
                          <option value="">Choose a category...</option>
                          <option value="academic">📚 Academic Performance</option>
                          <option value="behavior">👤 Behavior & Conduct</option>
                          <option value="health">💚 Health & Wellness</option>
                          <option value="attendance">📅 Attendance Issues</option>
                          <option value="transportation">🚌 Transportation</option>
                          <option value="other">💬 Other Concerns</option>
                        </Form.Select>
                        {formErrors.concernType && (
                          <Form.Control.Feedback type="invalid">
                            {formErrors.concernType}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold" style={{ color: '#4c63d2' }}>
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Priority Level
                        </Form.Label>
                        <div className="d-flex gap-2">
                          {['low', 'medium', 'high'].map((level) => (
                            <Button
                              key={level}
                              variant={feedbackForm.urgency === level ? 'primary' : 'outline-secondary'}
                              size="sm"
                              onClick={() => handleFormChange('urgency', level)}
                              style={{
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontWeight: '600',
                                textTransform: 'capitalize',
                                backgroundColor: feedbackForm.urgency === level ? getUrgencyColor(level) : 'transparent',
                                borderColor: getUrgencyColor(level),
                                color: feedbackForm.urgency === level ? '#fff' : getUrgencyColor(level)
                              }}
                            >
                              {level}
                            </Button>
                          ))}
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold" style={{ color: '#4c63d2' }}>
                          <i className="bi bi-pencil me-2"></i>
                          Subject *
                        </Form.Label>
                        <Form.Control 
                          type="text"
                          value={feedbackForm.subject}
                          onChange={(e) => handleFormChange('subject', e.target.value)}
                          placeholder="Brief description of your concern"
                          isInvalid={!!formErrors.subject}
                          style={{ 
                            borderRadius: '12px',
                            border: '2px solid #e9ecef',
                            padding: '12px 16px'
                          }}
                        />
                        {formErrors.subject && (
                          <Form.Control.Feedback type="invalid">
                            {formErrors.subject}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <Form.Check
                            type="switch"
                            id="callback-switch"
                            checked={feedbackForm.requestCallback}
                            onChange={(e) => handleFormChange('requestCallback', e.target.checked)}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <Form.Label className="fw-bold ms-2 mb-0" style={{ color: '#4c63d2' }}>
                            <i className="bi bi-telephone me-2"></i>
                            Request Callback
                          </Form.Label>
                        </div>
                        
                        {feedbackForm.requestCallback && (
                          <div className="mt-2">
                            <Row>
                              <Col md={7}>
                                <Form.Control
                                  type="time"
                                  value={feedbackForm.preferredTime}
                                  onChange={(e) => handleFormChange('preferredTime', e.target.value)}
                                  isInvalid={!!formErrors.preferredTime}
                                  style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                                />
                                {formErrors.preferredTime && (
                                  <Form.Control.Feedback type="invalid">
                                    {formErrors.preferredTime}
                                  </Form.Control.Feedback>
                                )}
                              </Col>
                              <Col md={5}>
                                <Form.Select
                                  value={feedbackForm.contactMethod}
                                  onChange={(e) => handleFormChange('contactMethod', e.target.value)}
                                  style={{ borderRadius: '8px', fontSize: '0.9rem' }}
                                >
                                  <option value="phone">📞 Phone</option>
                                  <option value="whatsapp">💬 WhatsApp</option>
                                  <option value="email">📧 Email</option>
                                </Form.Select>
                              </Col>
                            </Row>
                          </div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold" style={{ color: '#4c63d2' }}>
                      <i className="bi bi-chat-text me-2"></i>
                      Detailed Message *
                    </Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={4}
                      value={feedbackForm.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      placeholder="Please provide detailed information about your concern. Include specific examples, dates, or observations that would help the teacher understand the situation better."
                      isInvalid={!!formErrors.message}
                      style={{ 
                        borderRadius: '12px',
                        border: '2px solid #e9ecef',
                        padding: '15px',
                        fontSize: '0.95rem',
                        resize: 'vertical'
                      }}
                    />
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      {formErrors.message ? (
                        <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
                          {formErrors.message}
                        </Form.Control.Feedback>
                      ) : (
                        <Form.Text className="text-muted">
                          {feedbackForm.message.length}/500 characters
                        </Form.Text>
                      )}
                      <small className="text-muted">
                        {feedbackForm.message.length < 10 ? 'At least 10 characters required' : ''}
                      </small>
                    </div>
                  </Form.Group>

                  <div className="d-flex gap-3">
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '15px',
                        fontWeight: '700',
                        fontSize: '1rem',
                        padding: '12px 30px',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease',
                        minWidth: '150px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Send Message
                        </>
                      )}
                    </Button>

                    <Button 
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setFeedbackForm({
                        concernType: '',
                        urgency: 'medium',
                        subject: '',
                        message: '',
                        requestCallback: false,
                        preferredTime: '',
                        contactMethod: 'phone'
                      })}
                      style={{
                        borderRadius: '15px',
                        fontWeight: '600',
                        padding: '12px 25px',
                        borderColor: '#6c757d'
                      }}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset
                    </Button>
                  </div>

                  {/* Quick Contact Options */}
                  <div className="mt-4 pt-3" style={{ borderTop: '1px solid #e9ecef' }}>
                    <p className="mb-2 fw-bold" style={{ color: '#4c63d2', fontSize: '0.9rem' }}>
                      Need immediate assistance? Contact us directly:
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button 
                        variant="outline-success" 
                        size="sm" 
                        as="a" 
                        href="https://wa.me/254700000000" 
                        target="_blank"
                        style={{ borderRadius: '20px', fontWeight: '600' }}
                      >
                        <i className="bi bi-whatsapp me-1"></i>WhatsApp Teacher
                      </Button>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        as="a" 
                        href="tel:+254700000000"
                        style={{ borderRadius: '20px', fontWeight: '600' }}
                      >
                        <i className="bi bi-telephone me-1"></i>Call School
                      </Button>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        as="a" 
                        href="mailto:teacher@edufam.edu"
                        style={{ borderRadius: '20px', fontWeight: '600' }}
                      >
                        <i className="bi bi-envelope me-1"></i>Email
                      </Button>
                    </div>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Modal.Title>
            <i className="bi bi-check-circle me-2"></i>
            Confirm Submission
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Concern Type:</strong> 
            <Badge bg="info" className="ms-2">{feedbackForm.concernType}</Badge>
          </div>
          <div className="mb-3">
            <strong>Priority:</strong> 
            <Badge 
              className="ms-2" 
              style={{ backgroundColor: getUrgencyColor(feedbackForm.urgency) }}
            >
              {feedbackForm.urgency}
            </Badge>
          </div>
          <div className="mb-3">
            <strong>Subject:</strong> {feedbackForm.subject}
          </div>
          {feedbackForm.requestCallback && (
            <div className="mb-3">
              <strong>Callback Requested:</strong> Yes, at {feedbackForm.preferredTime} via {feedbackForm.contactMethod}
            </div>
          )}
          <p>Are you sure you want to send this message to your child's teacher?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={confirmSubmit}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            <i className="bi bi-send me-2"></i>
            Send Message
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ParentView;
