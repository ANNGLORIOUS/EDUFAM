import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup } from 'react-bootstrap';

type EdufamUser = {
  id: number;
  type: 'teacher' | 'student' | 'parent';
  name: string;
  email: string;
  class?: string;
  status?: 'pending' | 'approved' | 'rejected';
  childId?: number; // For parents, link to child
};

const UsersView: React.FC = () => {
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

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header>
              <h3><i className="bi bi-people me-2"></i>Add New User</h3>
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
              <h3><i className="bi bi-shield-check me-2"></i>Account Verification</h3>
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
        </Col>
      </Row>
    </Container>
  );
};

export default UsersView;
