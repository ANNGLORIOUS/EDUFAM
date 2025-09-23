import React, { useState, useMemo, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert, Nav, Tab, ListGroup } from 'react-bootstrap';

type EdufamUser = {
  id: number;
  type: 'teacher' | 'student' | 'parent';
  name: string;
  email: string;
  studentId?: string; // Add studentId for students
  class?: string;
  subject?: string;
  status?: 'pending' | 'approved' | 'rejected';
  childId?: number;
  children?: string[]; // Array of student IDs for parent-child linking
  dateAdded?: string;
};

type ChildSelectorProps = {
  selectedChildren: string[];
  onChildrenChange: (children: string[]) => void;
};

const ChildSelector: React.FC<ChildSelectorProps> = ({ selectedChildren, onChildrenChange }) => {
  const [newChildId, setNewChildId] = useState('');

  // Get students from localStorage for selection
  const getStudents = (): EdufamUser[] => {
    const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
    return users.filter((user: EdufamUser) => user.type === 'student');
  };

  const students = getStudents();

  const handleAddChild = () => {
    if (newChildId.trim() && !selectedChildren.includes(newChildId.trim())) {
      const updatedChildren = [...selectedChildren, newChildId.trim()];
      onChildrenChange(updatedChildren);
      setNewChildId('');
    }
  };

  const handleRemoveChild = (childId: string) => {
    const updatedChildren = selectedChildren.filter(id => id !== childId);
    onChildrenChange(updatedChildren);
  };

  const handleSelectFromList = (studentId: string) => {
    if (!selectedChildren.includes(studentId)) {
      const updatedChildren = [...selectedChildren, studentId];
      onChildrenChange(updatedChildren);
    }
  };

  return (
    <div>
      {/* Manual Input */}
      <div className="mb-3">
        <Form.Label>Add Child by Student ID</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Enter Student ID"
            value={newChildId}
            onChange={(e) => setNewChildId(e.target.value)}
            size="sm"
          />
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleAddChild}
            disabled={!newChildId.trim()}
          >
            <i className="bi bi-plus"></i> Add
          </Button>
        </div>
      </div>

      {/* Available Students */}
      {students.length > 0 && (
        <div className="mb-3">
          <Form.Label>Or Select from Existing Students</Form.Label>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            <ListGroup variant="flush">
              {students.map(student => (
                <ListGroup.Item
                  key={student.id}
                  className="d-flex justify-content-between align-items-center py-2"
                  style={{ fontSize: '0.85em' }}
                >
                  <div>
                    <strong>{student.name}</strong>
                    <br />
                    <small className="text-muted">
                      ID: {student.studentId} | Class: {student.class}
                    </small>
                  </div>
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => handleSelectFromList(student.studentId || '')}
                    disabled={selectedChildren.includes(student.studentId || '')}
                  >
                    {selectedChildren.includes(student.studentId || '') ? (
                      <i className="bi bi-check"></i>
                    ) : (
                      <i className="bi bi-plus"></i>
                    )}
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </div>
      )}

      {/* Selected Children */}
      {selectedChildren.length > 0 && (
        <div>
          <Form.Label>Selected Children ({selectedChildren.length})</Form.Label>
          <div className="d-flex flex-wrap gap-1">
            {selectedChildren.map(childId => (
              <Badge
                key={childId}
                bg="primary"
                className="d-flex align-items-center gap-1"
                style={{ fontSize: '0.8em' }}
              >
                {childId}
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-white"
                  onClick={() => handleRemoveChild(childId)}
                  style={{ fontSize: '0.7em', lineHeight: 1 }}
                >
                  <i className="bi bi-x"></i>
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CLASS_OPTIONS = [
  'Class 1',
  'Class 2',
  'Class 3'
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

  // Pending accounts state (persisted in localStorage)
  const [pendingAccounts, setPendingAccounts] = useState<EdufamUser[]>([]);

  // Load pending accounts from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('edufam_pending_accounts');
    if (stored) {
      setPendingAccounts(JSON.parse(stored));
    }
  }, []);

  // Save pending accounts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('edufam_pending_accounts', JSON.stringify(pendingAccounts));
  }, [pendingAccounts]);

  // Form state
  const [formData, setFormData] = useState({
    type: 'student',
    name: '',
    email: '',
    studentId: '',
    class: '',
    subject: '',
    children: [] as string[] // Array of student IDs for parent-child linking
  });

  // Reset specific fields when user type changes
  useEffect(() => {
    if (formData.type !== 'parent') {
      setFormData(prev => ({ ...prev, children: [] }));
    }
    if (formData.type !== 'student') {
      setFormData(prev => ({ ...prev, studentId: '', class: '' }));
    }
    if (formData.type !== 'teacher') {
      setFormData(prev => ({ ...prev, subject: '' }));
    }
  }, [formData.type]);

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
  const usersList = getUsers();
  const filteredUsers = useMemo(() => {
    return usersList.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || user.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType, usersList]);

  // User statistics
  const userStats = useMemo(() => {
    return {
      total: usersList.length,
      students: usersList.filter(u => u.type === 'student').length,
      teachers: usersList.filter(u => u.type === 'teacher').length,
      parents: usersList.filter(u => u.type === 'parent').length,
      pending: pendingAccounts.filter(p => p.status === 'pending').length
    };
  }, [usersList, pendingAccounts]);

  // Handlers
  const handleFormChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation based on user type
    if (formData.type === 'student') {
      if (!formData.name.trim() || !formData.studentId.trim()) {
        showMessage('Please fill in all required fields (name and student ID)', 'danger');
        return;
      }
      if (!formData.class) {
        showMessage('Please select a class for the student', 'danger');
        return;
      }
    } else {
      if (!formData.name.trim() || !formData.email.trim()) {
        showMessage('Please fill in all required fields', 'danger');
        return;
      }
    }
    if (formData.type === 'teacher' && !formData.subject) {
      showMessage('Please select a subject for the teacher', 'danger');
      return;
    }
    // Add to pending accounts (not users) for admin approval
    const newPending: EdufamUser = {
      id: Date.now(),
      type: formData.type as 'teacher' | 'student' | 'parent',
      name: formData.name.trim(),
      email: formData.type === 'student' ? `${formData.studentId}@school.edu` : formData.email.trim(),
      studentId: formData.type === 'student' ? formData.studentId.trim() : undefined,
      class: formData.type === 'student' ? formData.class : undefined,
      subject: formData.type === 'teacher' ? formData.subject : undefined,
      children: formData.type === 'parent' ? formData.children : undefined,
      status: 'pending',
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setPendingAccounts(prev => [...prev, newPending]);
    showMessage('Account request submitted for admin approval!');
    setFormData({ type: 'student', name: '', email: '', studentId: '', class: '', subject: '', children: [] });
  };

  const handleVerify = (id: number, approved: boolean) => {
    setPendingAccounts(prev => {
      const account = prev.find(acc => acc.id === id);
      if (!account) return prev;
      if (approved) {
        // Add to users and remove from pending, but prevent duplicate ids
        const users = getUsers();
        const filteredUsers = users.filter(u => u.id !== id);
        const newUser: EdufamUser = {
          ...account,
          status: 'approved',
        };
        setUsers([...filteredUsers, newUser]);
        showMessage('Account approved and added to users!', 'success');
      } else {
        showMessage('Account rejected.', 'danger');
      }
      // Remove from pending accounts
      return prev.filter(acc => acc.id !== id);
    });
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
                        <th>Email/Student ID</th>
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
                          <td>
                            {user.type === 'student' && user.studentId ? (
                              <span><strong>ID:</strong> {user.studentId}</span>
                            ) : (
                              user.email
                            )}
                          </td>
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
                            {user.type === 'parent' && user.children && user.children.length > 0 && (
                              <div>
                                <i className="bi bi-people me-1" style={{ color: '#6c63ff' }}></i>
                                Children: {user.children.join(', ')}
                              </div>
                            )}
                            {user.type === 'parent' && (!user.children || user.children.length === 0) && (
                              <span className="text-muted">No children linked</span>
                            )}
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
                        {formData.type === 'student' ? (
                          <>
                            <Form.Label>Student ID</Form.Label>
                            <Form.Control 
                              type="text"
                              value={formData.studentId} 
                              onChange={e => handleFormChange('studentId', e.target.value)}
                              placeholder="Enter student ID"
                              required
                            />
                          </>
                        ) : (
                          <>
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control 
                              type="email"
                              value={formData.email} 
                              onChange={e => handleFormChange('email', e.target.value)}
                              placeholder="Enter email address"
                              required
                            />
                          </>
                        )}
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

                      {formData.type === 'parent' && (
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <i className="bi bi-people me-2" style={{ color: '#6c63ff' }}></i>
                            Link Children
                          </Form.Label>
                          <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="mb-2">
                              <small className="text-muted">
                                Select students to link as children of this parent
                              </small>
                            </div>
                            <ChildSelector 
                              selectedChildren={formData.children}
                              onChildrenChange={(children) => handleFormChange('children', children)}
                            />
                          </div>
                        </Form.Group>
                      )}

                      <div className="mt-4">
                        <h6>Instructions:</h6>
                        <ul className="text-muted" style={{ fontSize: '0.9em' }}>
                          <li>All fields marked with * are required</li>
                          <li>Students require a unique Student ID and class assignment</li>
                          <li>Teachers and Parents require email addresses (must be unique)</li>
                          <li>Teachers must be assigned to a subject</li>
                          <li>Parents can be linked to their children using Student IDs</li>
                        </ul>
                      </div>
                    </Col>
                  </Row>

                  <hr />
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="secondary" 
                      className="me-2"
                      onClick={() => setFormData({ type: 'student', name: '', email: '', studentId: '', class: '', subject: '', children: [] })}
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
