import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert, Nav, Tab } from 'react-bootstrap';

type EdufamUser = {
  id: number;
  type: 'teacher' | 'student' | 'parent';
  name: string;
  email: string;
  class?: string;
  subject?: string;
  status?: 'pending' | 'approved' | 'rejected';
  childId?: number;
  dateAdded?: string;
};

const CLASS_OPTIONS = [
  '1 Ivory', '1 Pearl', '2 Ivory', '2 Pearl', '3 Ivory', '3 Pearl',
  '4 Ivory', '4 Pearl', '5 Ivory', '5 Pearl', '6 Ivory', '6 Pearl',
  '7 Ivory', '7 Pearl', '8 Ivory', '8 Pearl'
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'English', 'Science', 'Social Studies', 'Kiswahili',
  'Computer Studies', 'Physical Education', 'Art & Craft', 'Music'
];

const UsersView: React.FC = () => {
  // Main state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

  // Pending accounts state
  const [pendingAccounts, setPendingAccounts] = useState<EdufamUser[]>([
    { id: 1, type: 'parent', name: 'Mary Wanjiku', email: 'mary@example.com', status: 'pending', dateAdded: '2025-09-15' },
    { id: 2, type: 'teacher', name: 'John Mwangi', email: 'john@example.com', status: 'pending', dateAdded: '2025-09-14' }
  ]);

  // Form state
  const [formData, setFormData] = useState({
    type: 'student',
    name: '',
    email: '',
    class: '',
    subject: ''
  });

  // Utility functions
  const getUsers = (): EdufamUser[] => JSON.parse(localStorage.getItem('edufam_users') || '[]');
  const setUsers = (users: EdufamUser[]) => localStorage.setItem('edufam_users', JSON.stringify(users));

  const showMessage = (message: string, variant: 'success' | 'danger' = 'success') => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Filtered users based on search and filter
  const filteredUsers = useMemo(() => {
    const users = getUsers();
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || user.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType, getUsers()]);

  // User statistics
  const userStats = useMemo(() => {
    const users = getUsers();
    return {
      total: users.length,
      students: users.filter(u => u.type === 'student').length,
      teachers: users.filter(u => u.type === 'teacher').length,
      parents: users.filter(u => u.type === 'parent').length,
      pending: pendingAccounts.filter(p => p.status === 'pending').length
    };
  }, [getUsers(), pendingAccounts]);

  // Handlers
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showMessage('Please fill in all required fields', 'danger');
      return;
    }

    if (formData.type === 'student' && !formData.class) {
      showMessage('Please select a class for the student', 'danger');
      return;
    }

    if (formData.type === 'teacher' && !formData.subject) {
      showMessage('Please select a subject for the teacher', 'danger');
      return;
    }

    const users = getUsers();
    const newUser: EdufamUser = {
      id: Date.now(),
      type: formData.type as 'teacher' | 'student' | 'parent',
      name: formData.name.trim(),
      email: formData.email.trim(),
      class: formData.type === 'student' ? formData.class : undefined,
      subject: formData.type === 'teacher' ? formData.subject : undefined,
      status: 'approved',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, newUser]);
    setFormData({ type: 'student', name: '', email: '', class: '', subject: '' });
    showMessage(`${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} added successfully!`);
  };

  const handleVerify = (id: number, approved: boolean) => {
    setPendingAccounts(prev => 
      prev.map(acc => 
        acc.id === id 
          ? { ...acc, status: approved ? 'approved' : 'rejected' } 
          : acc
      )
    );
    showMessage(
      `Account ${approved ? 'approved' : 'rejected'} successfully`,
      approved ? 'success' : 'danger'
    );
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const users = getUsers();
      setUsers(users.filter(u => u.id !== userId));
      showMessage('User deleted successfully');
    }
  };

  return (
    <Container fluid className="mt-4">
      {showAlert && (
        <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      )}

      {/* Header with stats */}
      <Card className="mb-4" style={{ backgroundColor: 'white', border: '1px solid #dee2e6' }}>
        <Card.Body>
          <h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>
            <i className="bi bi-people me-2"></i>User Management
          </h2>
          <p style={{ color: '#6c63ff', fontSize: '1.1em', marginBottom: '1.5rem' }}>
            Manage students, teachers, and parents in your school system
          </p>
          
          <Row>
            <Col md={3}>
              <Card className="text-center mb-2">
                <Card.Body>
                  <h3 style={{ color: '#6c63ff', marginBottom: '0.5rem' }}>{userStats.total}</h3>
                  <span style={{ color: '#1e0a3c', fontWeight: 600 }}>Total Users</span>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="text-center mb-2">
                <Card.Body>
                  <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>{userStats.students}</h4>
                  <span style={{ fontSize: '0.9em' }}>Students</span>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="text-center mb-2">
                <Card.Body>
                  <h4 style={{ color: '#007bff', marginBottom: '0.5rem' }}>{userStats.teachers}</h4>
                  <span style={{ fontSize: '0.9em' }}>Teachers</span>
                </Card.Body>
              </Card>
            </Col>
            <Col md={2}>
              <Card className="text-center mb-2">
                <Card.Body>
                  <h4 style={{ color: '#fd7e14', marginBottom: '0.5rem' }}>{userStats.parents}</h4>
                  <span style={{ fontSize: '0.9em' }}>Parents</span>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-2">
                <Card.Body>
                  <h4 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>{userStats.pending}</h4>
                  <span style={{ fontSize: '0.9em' }}>Pending Approval</span>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Navigation Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="overview">Overview</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="add-user">Add User</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="pending">
              Pending Approvals {userStats.pending > 0 && <Badge bg="danger">{userStats.pending}</Badge>}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Overview Tab */}
          <Tab.Pane eventKey="overview">
            <Card>
              <Card.Header>
                <Row className="align-items-center">
                  <Col>
                    <h5 className="mb-0">All Users</h5>
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                      <option value="all">All Types</option>
                      <option value="student">Students</option>
                      <option value="teacher">Teachers</option>
                      <option value="parent">Parents</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-people" style={{ fontSize: '3rem', color: '#6c63ff' }}></i>
                    <h5 className="mt-2">No users found</h5>
                    <p className="text-muted">
                      {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding users to the system'}
                    </p>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Details</th>
                        <th>Date Added</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <strong>{user.name}</strong>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <Badge bg={
                              user.type === 'student' ? 'success' : 
                              user.type === 'teacher' ? 'primary' : 'warning'
                            }>
                              {user.type.charAt(0).toUpperCase() + user.type.slice(1)}
                            </Badge>
                          </td>
                          <td>
                            {user.type === 'student' && user.class && <span>Class: {user.class}</span>}
                            {user.type === 'teacher' && user.subject && <span>Subject: {user.subject}</span>}
                            {user.type === 'parent' && user.childId && <span>Child ID: {user.childId}</span>}
                          </td>
                          <td>{user.dateAdded || 'N/A'}</td>
                          <td>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>
          {/* Add User Tab */}
          <Tab.Pane eventKey="add-user">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Add New User</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleAddUser}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>User Type</Form.Label>
                        <Form.Select 
                          value={formData.type} 
                          onChange={e => handleFormChange('type', e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="parent">Parent</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control 
                          type="text"
                          value={formData.name} 
                          onChange={e => handleFormChange('name', e.target.value)}
                          placeholder="Enter full name"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control 
                          type="email"
                          value={formData.email} 
                          onChange={e => handleFormChange('email', e.target.value)}
                          placeholder="Enter email address"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      {formData.type === 'student' && (
                        <Form.Group className="mb-3">
                          <Form.Label>Class</Form.Label>
                          <Form.Select 
                            value={formData.class} 
                            onChange={e => handleFormChange('class', e.target.value)}
                            required
                          >
                            <option value="">Select class...</option>
                            {CLASS_OPTIONS.map(cls => (
                              <option key={cls} value={cls}>{cls}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      )}

                      {formData.type === 'teacher' && (
                        <Form.Group className="mb-3">
                          <Form.Label>Subject</Form.Label>
                          <Form.Select 
                            value={formData.subject} 
                            onChange={e => handleFormChange('subject', e.target.value)}
                            required
                          >
                            <option value="">Select subject...</option>
                            {SUBJECT_OPTIONS.map(subject => (
                              <option key={subject} value={subject}>{subject}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      )}

                      <div className="mt-4">
                        <h6>Instructions:</h6>
                        <ul className="text-muted" style={{ fontSize: '0.9em' }}>
                          <li>All fields marked with * are required</li>
                          <li>Email addresses must be unique</li>
                          <li>Students must be assigned to a class</li>
                          <li>Teachers must be assigned to a subject</li>
                        </ul>
                      </div>
                    </Col>
                  </Row>

                  <hr />
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="secondary" 
                      className="me-2"
                      onClick={() => setFormData({ type: 'student', name: '', email: '', class: '', subject: '' })}
                    >
                      Reset
                    </Button>
                    <Button type="submit" variant="primary">
                      <i className="bi bi-plus-circle me-2"></i>Add User
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Pending Approvals Tab */}
          <Tab.Pane eventKey="pending">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Pending Account Approvals</h5>
              </Card.Header>
              <Card.Body>
                {pendingAccounts.filter(acc => acc.status === 'pending').length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-shield-check" style={{ fontSize: '3rem', color: '#28a745' }}></i>
                    <h5 className="mt-2">No pending approvals</h5>
                    <p className="text-muted">All account requests have been processed</p>
                  </div>
                ) : (
                  <div>
                    <h6 className="mb-3">Accounts awaiting approval:</h6>
                    {pendingAccounts.filter(acc => acc.status === 'pending').map(acc => (
                      <Card key={acc.id} className="mb-3">
                        <Card.Body>
                          <Row className="align-items-center">
                            <Col md={8}>
                              <h6 className="mb-1">{acc.name}</h6>
                              <p className="mb-1 text-muted">{acc.email}</p>
                              <Badge bg={acc.type === 'teacher' ? 'primary' : 'warning'}>
                                {acc.type.charAt(0).toUpperCase() + acc.type.slice(1)}
                              </Badge>
                              <small className="ms-2 text-muted">
                                Requested: {acc.dateAdded}
                              </small>
                            </Col>
                            <Col md={4} className="text-end">
                              <Button 
                                variant="success" 
                                size="sm" 
                                className="me-2"
                                onClick={() => handleVerify(acc.id, true)}
                              >
                                <i className="bi bi-check-lg me-1"></i>Approve
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleVerify(acc.id, false)}
                              >
                                <i className="bi bi-x-lg me-1"></i>Reject
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Recently processed */}
                {pendingAccounts.filter(acc => acc.status !== 'pending').length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3">Recently processed:</h6>
                    {pendingAccounts
                      .filter(acc => acc.status !== 'pending')
                      .slice(0, 5)
                      .map(acc => (
                        <div key={acc.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                          <div>
                            <strong>{acc.name}</strong>
                            <span className="text-muted ms-2">({acc.type})</span>
                          </div>
                          <Badge bg={acc.status === 'approved' ? 'success' : 'danger'}>
                            {acc.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default UsersView;
