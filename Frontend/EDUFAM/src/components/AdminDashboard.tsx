import React, { useState } from 'react';
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
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Admin Sidebar</h5>
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item action active={activePage === 'home'} onClick={() => setActivePage('home')}>Dashboard Home</ListGroup.Item>
                <ListGroup.Item action active={activePage === 'users'} onClick={() => setActivePage('users')}>Manage Users</ListGroup.Item>
                <ListGroup.Item action active={activePage === 'reports'} onClick={() => setActivePage('reports')}>School Reports</ListGroup.Item>
                <ListGroup.Item action active={activePage === 'ussd'} onClick={() => setActivePage('ussd')}>USSD Services</ListGroup.Item>
                <ListGroup.Item action active={activePage === 'settings'} onClick={() => setActivePage('settings')}>Settings</ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
          <Col md={9}>
            {activePage === 'home' && (
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Admin Dashboard</h5>
                </Card.Header>
                <Card.Body>
                  <h4>Welcome, Admin!</h4>
                  <p>Use the sidebar to manage users, view reports, and configure school settings.</p>
                </Card.Body>
              </Card>
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
