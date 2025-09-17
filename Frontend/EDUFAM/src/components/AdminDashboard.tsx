import React, { useState } from 'react';
import Sidebar from './Sidebar';
import CustomNavbar from './Navbar';
import Footer from './Footer';
import { Container, Row, Col, Card, ListGroup, Button, Form } from 'react-bootstrap';

type EdufamUser = {
  id: number;
  type: 'teacher' | 'student' | 'parent';
  name: string;
  email: string;
  class?: string;
  status?: 'pending' | 'approved' | 'rejected';
  childId?: number; // For parents, link to child
};

const AdminDashboard: React.FC = () => {
  // Simulated pending accounts (would come from backend in real app)
  const [pendingAccounts, setPendingAccounts] = useState<EdufamUser[]>([
    { id: 1, type: 'parent', name: 'Mary Wanjiku', email: 'mary@example.com', status: 'pending' },
    { id: 2, type: 'teacher', name: 'John Mwangi', email: 'john@example.com', status: 'pending' }
  ]);

  const handleVerify = (id: number, approved: boolean) => {
    setPendingAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, status: approved ? 'approved' : 'rejected' } : acc));
  };

  // Local storage helpers
  const getUsers = (): EdufamUser[] => JSON.parse(localStorage.getItem('edufam_users') || '[]');
  const setUsers = (users: EdufamUser[]) => localStorage.setItem('edufam_users', JSON.stringify(users));

  // Add user form state
  const [userType, setUserType] = useState('teacher');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userClass, setUserClass] = useState('');

  // Add student to class state
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignClass, setAssignClass] = useState('');

  // Add parent-child linking state
  const [parentChildId, setParentChildId] = useState('');
  const [parentIdToLink, setParentIdToLink] = useState('');

  // Add user handler
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail || (userType === 'student' && !userClass)) return;
    const users = getUsers();
    const newUser: EdufamUser = {
      id: Date.now(),
      type: userType as 'teacher' | 'student' | 'parent',
      name: userName,
      email: userEmail,
      class: userType === 'student' ? userClass : '',
      status: 'approved', // Directly approved when added by admin
    };
    setUsers([...users, newUser]);
    setUserName('');
    setUserEmail('');
    setUserClass('');
    alert('User added!');
  };

  // Assign student to class handler
  const handleAssignStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const updated = users.map((u: EdufamUser) => u.id.toString() === assignStudentId ? { ...u, class: assignClass } : u);
    setUsers(updated);
    setAssignStudentId('');
    setAssignClass('');
    alert('Student assigned to class!');
  };

  // Link parent to child handler
  const handleLinkParentChild = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const updated = users.map((u: EdufamUser) => u.id.toString() === parentIdToLink ? { ...u, childId: Number(parentChildId) } : u);
    setUsers(updated);
    setParentIdToLink('');
    setParentChildId('');
    alert('Parent linked to child!');
  };

  const [activePage, setActivePage] = useState('home');

  return (
    <>
      <CustomNavbar />
      <Container fluid className="py-4">
        <Row>
          <Col md={3}>
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
          </Col>
          <Col md={9}>
            {activePage === 'home' && (
              <>
                <Card className="mb-4" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                  <Card.Body>
                    <h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>Welcome, Admin!</h2>
                    <p style={{ color: '#6c63ff', fontSize: '1.1em' }}>Manage your school efficiently with EDUFAM.</p>
                    <Row className="mb-4">
                      {activePage === 'home' && (() => {
                        const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
                        const students = users.filter((u: any) => u.type === 'student');
                        const teachers = users.filter((u: any) => u.type === 'teacher');
                        const parents = users.filter((u: any) => u.type === 'parent');
                        const classes = [...new Set(students.map((s: any) => s.class))].length;
                        const events = 5; // Example static value
                        // Demo performance data
                        const performance = {
                          year: '2025',
                          term: 'Term 3',
                          score: 78, // out of 100
                          trend: 'up', // 'up' or 'down'
                          pdfUrl: '/public/performance-report-2025-term3.pdf',
                        };
                        return (
                          <>
                            <Col md={2}>
                              <Card className="mb-2">
                                <Card.Body>
                                  <h5>Students</h5>
                                  <h3>{students.length}</h3>
                                  <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                                    {(() => {
                                      if (students.length === 0) return 'No students';
                                      const classCounts: Record<string, number> = {};
                                      students.forEach((s: any) => {
                                        classCounts[s.class] = (classCounts[s.class] || 0) + 1;
                                      });
                                      const highestClass = Object.entries(classCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max);
                                      return `Most: ${highestClass[0]} (${highestClass[1]})`;
                                    })()}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={2}>
                              <Card className="mb-2">
                                <Card.Body>
                                  <h5>Teachers</h5>
                                  <h3>{teachers.length}</h3>
                                  <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                                    {(() => {
                                      if (teachers.length === 0) return 'No teachers';
                                      const subjectCounts: Record<string, number> = {};
                                      teachers.forEach((t: any) => {
                                        if (t.subject) subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1;
                                      });
                                      if (Object.keys(subjectCounts).length === 0) return '';
                                      const highestSubject = Object.entries(subjectCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max);
                                      return `Most: ${highestSubject[0]} (${highestSubject[1]})`;
                                    })()}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={2}>
                              <Card className="mb-2">
                                <Card.Body>
                                  <h5>Parents</h5>
                                  <h3>{parents.length}</h3>
                                  <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                                    {(() => {
                                      if (parents.length === 0) return 'No parents';
                                      const childrenCounts: Record<string, number> = {};
                                      parents.forEach((p: any) => {
                                        if (p.children && Array.isArray(p.children)) {
                                          childrenCounts[p.name] = p.children.length;
                                        }
                                      });
                                      if (Object.keys(childrenCounts).length === 0) return '';
                                      const highestParent = Object.entries(childrenCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max);
                                      return `Most children: ${highestParent[0]} (${highestParent[1]})`;
                                    })()}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={2}>
                              <Card className="mb-2">
                                <Card.Body>
                                  <h5>Classes</h5>
                                  <h3>{classes}</h3>
                                  <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                                    {(() => {
                                      if (students.length === 0) return '';
                                      const classCounts: Record<string, number> = {};
                                      students.forEach((s: any) => {
                                        classCounts[s.class] = (classCounts[s.class] || 0) + 1;
                                      });
                                      if (Object.keys(classCounts).length === 0) return '';
                                      const highestClass = Object.entries(classCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max);
                                      return `Largest: ${highestClass[0]} (${highestClass[1]})`;
                                    })()}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={2}><Card className="mb-2"><Card.Body><h5>Events</h5><h3>{events}</h3></Card.Body></Card></Col>
                            <Col md={2}>
                              <Card className="mb-2">
                                <Card.Body>
                                  <h5>Overall Performance</h5>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '1.5em', fontWeight: 700 }}>{performance.score}%</span>
                                    {performance.trend === 'up' ? (
                                      <span style={{ color: 'green', fontSize: '1.5em' }} title="Improving">
                                        <i className="bi bi-arrow-up-circle-fill"></i>
                                      </span>
                                    ) : (
                                      <span style={{ color: 'red', fontSize: '1.5em' }} title="Declining">
                                        <i className="bi bi-arrow-down-circle-fill"></i>
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>{performance.year} - {performance.term}</div>
                                  <a href={performance.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9em', color: '#1e0a3c', textDecoration: 'underline' }}>View PDF Results</a>
                                </Card.Body>
                              </Card>
                            </Col>
                          </>
                        );
                      })()}
                    </Row>
                    <Row>
                      {/* Recent Activity & Pending Approvals */}
                      <Col md={6}>
                        <Card className="mb-4">
                          <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Recent Activity</h5></Card.Header>
                          <ListGroup>
                            <ListGroup.Item>User registrations, fee payments, feedback submissions, bulk SMS sent (demo data)</ListGroup.Item>
                          </ListGroup>
                        </Card>
                        <Card className="mb-4">
                          <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Pending Approvals</h5></Card.Header>
                          <ListGroup>
                            <ListGroup.Item>Account verifications, bulk SMS approvals (demo data)</ListGroup.Item>
                          </ListGroup>
                        </Card>
                      </Col>
                      {/* Notifications & Shortcuts */}
                      <Col md={6}>
                        <Card className="mb-4">
                          <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Notifications</h5></Card.Header>
                          <ListGroup>
                            <ListGroup.Item>System updates, deadlines, reminders (demo data)</ListGroup.Item>
                          </ListGroup>
                        </Card>
                        <Card className="mb-4">
                          <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Shortcuts</h5></Card.Header>
                          <div className="d-flex flex-wrap gap-2 p-2">
                            <Button variant="primary">Add User</Button>
                            <Button variant="info">View Reports</Button>
                            <Button variant="success">Send Bulk SMS</Button>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      {/* School Calendar & Fee Summary */}
                      <Col md={6}>
                        <Card className="mb-4">
                          <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>School Calendar</h5></Card.Header>
                          <ListGroup>
                            <ListGroup.Item>Upcoming events and important dates (demo data)</ListGroup.Item>
                          </ListGroup>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="mb-4">
                          <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Fee Summary</h5></Card.Header>
                          <ListGroup>
                            <ListGroup.Item>Total fees collected, outstanding balances, students with fee balance (demo data)</ListGroup.Item>
                          </ListGroup>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </>
            )}
            {activePage === 'users' && (
              <>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Add New User</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form onSubmit={handleAddUser} className="mb-4">
                      <Form.Group className="mb-2">
                        <Form.Label>User Type</Form.Label>
                        <Form.Select value={userType} onChange={e => setUserType(e.target.value)}>
                          <option value="teacher">Teacher</option>
                          <option value="student">Student</option>
                          <option value="parent">Parent</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Name</Form.Label>
                        <Form.Control value={userName} onChange={e => setUserName(e.target.value)} required />
                      </Form.Group>
                      <Form.Group className="mb-2">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} required />
                      </Form.Group>
                      {userType === 'student' && (
                        <Form.Group className="mb-2">
                          <Form.Label>Class</Form.Label>
                          <Form.Control value={userClass} onChange={e => setUserClass(e.target.value)} required />
                        </Form.Group>
                      )}
                      <Button type="submit" variant="primary">Add User</Button>
                    </Form>
                    <h6>All Users</h6>
                    <ListGroup className="mb-4">
                      {getUsers().length === 0 && <ListGroup.Item>No users yet.</ListGroup.Item>}
                      {getUsers().map((u: EdufamUser) => (
                        <ListGroup.Item key={u.id}>
                          <strong>{u.name}</strong> <span className="text-muted">({u.type})</span> <br />
                          <span style={{ fontSize: '0.95em' }}>{u.email}</span>
                          {u.type === 'student' && u.class && <span> - Class: {u.class}</span>}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                    <Card className="mb-4">
                      <Card.Header>
                        <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Assign Student to Class</h5>
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={handleAssignStudent} className="mb-2">
                          <Form.Group className="mb-2">
                            <Form.Label>Student ID</Form.Label>
                            <Form.Control value={assignStudentId} onChange={e => setAssignStudentId(e.target.value)} required />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Class</Form.Label>
                            <Form.Control value={assignClass} onChange={e => setAssignClass(e.target.value)} required />
                          </Form.Group>
                          <Button type="submit" variant="success">Assign</Button>
                        </Form>
                      </Card.Body>
                    </Card>
                    <Card className="mb-4">
                      <Card.Header>
                        <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Link Parent to Child</h5>
                      </Card.Header>
                      <Card.Body>
                        <Form onSubmit={handleLinkParentChild} className="mb-2">
                          <Form.Group className="mb-2">
                            <Form.Label>Parent ID</Form.Label>
                            <Form.Control value={parentIdToLink} onChange={e => setParentIdToLink(e.target.value)} required />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Child (Student) ID</Form.Label>
                            <Form.Control value={parentChildId} onChange={e => setParentChildId(e.target.value)} required />
                          </Form.Group>
                          <Button type="submit" variant="info">Link</Button>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Card.Body>
                </Card>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Account Verification</h5>
                  </Card.Header>
                  <Card.Body>
                    <h6>Pending Parent/Teacher Accounts</h6>
                    <ListGroup>
                      {pendingAccounts.filter(acc => acc.status === 'pending').length === 0 && (
                        <ListGroup.Item>No pending accounts.</ListGroup.Item>
                      )}
                      {pendingAccounts.filter(acc => acc.status === 'pending').map(acc => (
                        <ListGroup.Item key={acc.id} className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{acc.name}</strong> <span className="text-muted">({acc.type})</span><br />
                            <span style={{ fontSize: '0.95em' }}>{acc.email}</span>
                          </div>
                          <div>
                            <Button variant="success" size="sm" onClick={() => handleVerify(acc.id, true)} className="me-2">Approve</Button>
                            <Button variant="danger" size="sm" onClick={() => handleVerify(acc.id, false)}>Reject</Button>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                    <h6 className="mt-4">Recently Verified</h6>
                    <ListGroup>
                      {pendingAccounts.filter(acc => acc.status !== 'pending').length === 0 && (
                        <ListGroup.Item>No verified/rejected accounts yet.</ListGroup.Item>
                      )}
                      {pendingAccounts.filter(acc => acc.status !== 'pending').map(acc => (
                        <ListGroup.Item key={acc.id}>
                          <strong>{acc.name}</strong> <span className="text-muted">({acc.type})</span> - <span style={{ color: acc.status === 'approved' ? 'green' : 'red' }}>{acc.status}</span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </>
              
            )}
            {activePage === 'reports' && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>School Reports</h5>
                </Card.Header>
                <Card.Body>
                  <h6>Parent Feedback Reports</h6>
                  <Button variant="outline-primary" className="mb-2">Download PDF</Button>
                  <ListGroup className="mb-4">
                    {/* Map feedbacks from localStorage */}
                    {(() => {
                      const feedbacks = JSON.parse(localStorage.getItem('edufam_feedbacks') || '[]');
                      if (!feedbacks.length) return <ListGroup.Item>No feedback yet.</ListGroup.Item>;
                      return feedbacks.map((fb: any, idx: number) => (
                        <ListGroup.Item key={idx}>
                          <strong>{fb.from}</strong> ({fb.class}) - {fb.concernType}<br />
                          {fb.message}
                          {fb.requestCallback && <span style={{ color: '#a83279', fontWeight: 500 }}> Requested Callback</span>}
                        </ListGroup.Item>
                      ));
                    })()}
                  </ListGroup>
                  <h6>All Teachers, Students, Parents</h6>
                  <Button variant="outline-primary" className="mb-2">Download PDF</Button>
                  <ListGroup className="mb-4">
                    {(() => {
                      const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
                      if (!users.length) return <ListGroup.Item>No users yet.</ListGroup.Item>;
                      return users.map((u: any) => (
                        <ListGroup.Item key={u.id}>
                          <strong>{u.name}</strong> <span className="text-muted">({u.type})</span> {u.class && <span>- Class: {u.class}</span>}
                        </ListGroup.Item>
                      ));
                    })()}
                  </ListGroup>
                  <h6>Class Performance Reports (Uploaded by Teachers)</h6>
                  <Button variant="outline-primary" className="mb-2">Download PDF</Button>
                  <ListGroup className="mb-4">
                    <ListGroup.Item>Class performance data coming soon.</ListGroup.Item>
                  </ListGroup>
                  <h6>Events Reports</h6>
                  <Button variant="outline-primary" className="mb-2">Download PDF</Button>
                  <ListGroup className="mb-4">
                    <ListGroup.Item>Events data coming soon.</ListGroup.Item>
                  </ListGroup>
                  <h6>Attendance Reports (Filter by Student)</h6>
                  <Button variant="outline-primary" className="mb-2">Download PDF</Button>
                  <ListGroup className="mb-4">
                    <ListGroup.Item>Attendance data coming soon.</ListGroup.Item>
                  </ListGroup>
                  <h6>Fees Overall Report (Students with Fee Balance)</h6>
                  <Button variant="outline-primary" className="mb-2">Download PDF</Button>
                  <ListGroup className="mb-4">
                    <ListGroup.Item>Fees data coming soon.</ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            )}
              {activePage === 'accounts' && (
                                <>
                                  {/* Accounts & Fees Header */}
                                  <Card className="mb-4 admin-dashboard-section">
                                    <Card.Body>
                                      <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h2>Accounts & Fees</h2>
                                        <Form.Select style={{ maxWidth: 180 }} defaultValue="2025 Term 3">
                                          <option>2025 Term 1</option>
                                          <option>2025 Term 2</option>
                                          <option>2025 Term 3</option>
                                        </Form.Select>
                                      </div>
                                      <Row className="mb-4">
                                        {/* Fee Summary Cards */}
                                        {(() => {
                                          // Demo fee data
                                          const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
                                          const students = users.filter((u: any) => u.type === 'student');
                                          const feeData = students.map((s: any): {
                                            name: string;
                                            class: string;
                                            parent: string;
                                            totalFee: number;
                                            paid: number;
                                            dueDate: string;
                                          } => ({
                                            name: s.name,
                                            class: s.class || '',
                                            parent: users.find((u: any) => u.childId === s.id)?.name || '',
                                            totalFee: 30000,
                                            paid: Math.floor(Math.random() * 30000),
                                            dueDate: '2025-09-30',
                                          }));
                                          const totalFeeYear = feeData.reduce((sum: number, s: { totalFee: number }) => sum + s.totalFee, 0);
                                          const totalPaid = feeData.reduce((sum: number, s: { paid: number }) => sum + s.paid, 0);
                                          const currentTermBalance = feeData.reduce((sum: number, s: { totalFee: number; paid: number }) => sum + (s.totalFee - s.paid), 0);
                                          const studentsWithBalance = feeData.filter((s: { totalFee: number; paid: number }) => s.totalFee - s.paid > 0);
                                          return (
                                            <>
                                              <Col md={3}>
                                                <Card className="mb-2" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                                                  <Card.Body>
                                                    <div className="stat-label" style={{ color: '#6c63ff' }}>Total Fees (Year)</div>
                                                    <div className="stat-value" style={{ color: '#1e0a3c' }}>KES {totalFeeYear.toLocaleString()}</div>
                                                  </Card.Body>
                                                </Card>
                                              </Col>
                                              <Col md={3}>
                                                <Card className="mb-2" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                                                  <Card.Body>
                                                    <div className="stat-label" style={{ color: '#fb7100' }}>Amount Paid</div>
                                                    <div className="stat-value" style={{ color: '#1e0a3c' }}>KES {totalPaid.toLocaleString()}</div>
                                                  </Card.Body>
                                                </Card>
                                              </Col>
                                              <Col md={3}>
                                                <Card className="mb-2" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                                                  <Card.Body>
                                                    <div className="stat-label" style={{ color: '#fd7e14' }}>Current Term Balance</div>
                                                    <div className="stat-value" style={{ color: '#1e0a3c' }}>KES {currentTermBalance.toLocaleString()}</div>
                                                  </Card.Body>
                                                </Card>
                                              </Col>
                                              <Col md={3}>
                                                <Card className="mb-2" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                                                  <Card.Body>
                                                    <div className="stat-label" style={{ color: '#6c63ff' }}>Students w/ Balance</div>
                                                    <div className="stat-value" style={{ color: '#dc3545' }}>{studentsWithBalance.length}</div>
                                                  </Card.Body>
                                                </Card>
                                              </Col>
                                            </>
                                          );
                                        })()}
                                      </Row>
                                      {/* Fee Updates Table */}
                                      <Card className="mb-4" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
                                        <Card.Header style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #fb7100 100%)', color: 'white', fontWeight: 600 }}><h5>Fee Updates</h5></Card.Header>
                                        <div style={{ overflowX: 'auto' }}>
                                          <table className="table table-striped">
                                            <thead style={{ background: '#f8fafc' }}>
                                              <tr>
                                                <th>Student</th>
                                                <th>Class</th>
                                                <th>Parent</th>
                                                <th>Total Fee</th>
                                                <th>Paid</th>
                                                <th>Balance</th>
                                                <th>Due Date</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {(() => {
                                                const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
                                                const students = users.filter((u: any) => u.type === 'student');
                                                return students.map((s: any) => {
                                                  const parent = users.find((u: any) => u.childId === s.id);
                                                  const totalFee = 30000;
                                                  const paid = Math.floor(Math.random() * 30000);
                                                  const balance = totalFee - paid;
                                                  const dueDate = '2025-09-30';
                                                  return (
                                                    <tr key={s.id} style={{ background: balance === 0 ? '#e0ffe0' : '#fff0f0' }}>
                                                      <td>{s.name}</td>
                                                      <td>{s.class || '-'}</td>
                                                      <td>{parent ? parent.name : '-'}</td>
                                                      <td>KES {totalFee.toLocaleString()}</td>
                                                      <td>KES {paid.toLocaleString()}</td>
                                                      <td>KES {balance.toLocaleString()}</td>
                                                      <td>{dueDate}</td>
                                                      <td>{balance === 0 ? <span style={{ color: '#198754', fontWeight: 600 }}>Paid</span> : <span style={{ color: '#dc3545', fontWeight: 600 }}>Unpaid</span>}</td>
                                                      <td><Button size="sm" variant="info">Push Update</Button></td>
                                                    </tr>
                                                  );
                                                });
                                              })()}
                                            </tbody>
                                          </table>
                                        </div>
                                      </Card>
                                      {/* Overdue Students & Bulk Actions */}
                                      <Row>
                                        <Col md={6}>
                                          <Card className="mb-4">
                                            <Card.Header><h5>Overdue Students</h5></Card.Header>
                                            <ListGroup>
                                              {(() => {
                                                const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
                                                const students = users.filter((u: any) => u.type === 'student');
                                                return students.filter((s: any) => {
                                                  const paid = Math.floor(Math.random() * 30000);
                                                  return 30000 - paid > 0;
                                                }).map((s: any) => (
                                                  <ListGroup.Item key={s.id}>{s.name} ({s.class || '-'}) - Balance: KES {(30000 - Math.floor(Math.random() * 30000)).toLocaleString()}</ListGroup.Item>
                                                ));
                                              })()}
                                            </ListGroup>
                                          </Card>
                                        </Col>
                                        <Col md={6}>
                                          <Card className="mb-4">
                                            <Card.Header><h5>Bulk Actions</h5></Card.Header>
                                            <div className="d-flex flex-column gap-2 p-2">
                                              <Button variant="warning">Send Fee Reminders to All</Button>
                                              <Button variant="secondary">Export Fee Data (CSV/PDF)</Button>
                                            </div>
                                          </Card>
                                        </Col>
                                      </Row>
                                    </Card.Body>
                                  </Card>
                                </>
            )}
            {activePage === 'settings' && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Settings</h5>
                </Card.Header>
                <Card.Body>
                  <p>Settings section coming soon.</p>
                </Card.Body>
              </Card>
            )}
            {activePage === 'ussd' && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>USSD Services & Bulk SMS</h5>
                </Card.Header>
                <Card.Body>
                  <Form className="mb-3 d-flex flex-wrap gap-2 align-items-end">
                    <Form.Group>
                      <Form.Label>Date</Form.Label>
                      <Form.Control type="date" />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>User</Form.Label>
                      <Form.Control type="text" placeholder="User name or ID" />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Type</Form.Label>
                      <Form.Select>
                        <option value="">All</option>
                        <option value="SMS">SMS</option>
                        <option value="USSD">USSD</option>
                        <option value="App">App</option>
                      </Form.Select>
                    </Form.Group>
                    <Button variant="primary">Filter</Button>
                    <Button variant="outline-success">Export CSV</Button>
                            
                  </Form>
                  <ListGroup>
                    {/* Example data, replace with real USSD/SMS/App logs */}
                    <ListGroup.Item>
                      <strong>User:</strong> Jane Doe <strong>Date:</strong> 2025-09-17 <strong>Type:</strong> USSD <strong>Status:</strong> Delivered
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>User:</strong> John Mwangi <strong>Date:</strong> 2025-09-16 <strong>Type:</strong> SMS <strong>Status:</strong> Failed
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>User:</strong> Mary Wanjiku <strong>Date:</strong> 2025-09-15 <strong>Type:</strong> App <strong>Status:</strong> Delivered
                    </ListGroup.Item>
                  </ListGroup>
                  <hr />
                  <h6>Bulk SMS Approval & Delivery Tracking</h6>
                  <ListGroup className="mb-3">
                    {/* Example bulk SMS data, replace with real data */}
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Message:</strong> School closed tomorrow<br />
                        <strong>Recipients:</strong> 120 parents<br />
                        <strong>Sent:</strong> 2025-09-16 10:00 AM<br />
                        <strong>Status:</strong> Delivered to 115, Failed for 5
                      </div>
                      <span className="badge bg-success">Approved</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Message:</strong> Fee payment reminder<br />
                        <strong>Recipients:</strong> 120 parents<br />
                        <strong>Sent:</strong> Pending approval<br />
                        <strong>Status:</strong> Not sent
                      </div>
                      <Button variant="primary" size="sm">Approve & Send</Button>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default AdminDashboard;
