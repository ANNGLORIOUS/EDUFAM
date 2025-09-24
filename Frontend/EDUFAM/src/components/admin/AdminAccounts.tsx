import React from 'react';
import { Card, Row, Col, Table, Button, Badge } from 'react-bootstrap';

const AdminAccounts: React.FC = () => {
  // Mock user accounts data
  const userAccounts = [
    { id: 1, name: 'John Doe', email: 'john@edufam.com', role: 'Teacher', status: 'Active', lastLogin: '2025-09-18' },
    { id: 2, name: 'Jane Smith', email: 'jane@edufam.com', role: 'Parent', status: 'Active', lastLogin: '2025-09-17' },
    { id: 3, name: 'Mike Johnson', email: 'mike@edufam.com', role: 'Student', status: 'Inactive', lastLogin: '2025-09-15' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@edufam.com', role: 'Teacher', status: 'Active', lastLogin: '2025-09-18' },
    { id: 5, name: 'David Brown', email: 'david@edufam.com', role: 'Parent', status: 'Pending', lastLogin: 'Never' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge bg="success">{status}</Badge>;
      case 'Inactive':
        return <Badge bg="secondary">{status}</Badge>;
      case 'Pending':
        return <Badge bg="warning">{status}</Badge>;
      default:
        return <Badge bg="light">{status}</Badge>;
    }
  };

  return (
    <div className="admin-accounts">
      <Row className="mb-4">
        <Col>
          <h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>User Accounts Management</h2>
          <p style={{ color: '#6c63ff' }}>Manage all user accounts in the EDUFAM system.</p>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Total Users</h5>
              <h3>{userAccounts.length}</h3>
              <small className="text-muted">All accounts</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Active Users</h5>
              <h3>{userAccounts.filter(u => u.status === 'Active').length}</h3>
              <small className="text-success">Currently active</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Pending Approval</h5>
              <h3>{userAccounts.filter(u => u.status === 'Pending').length}</h3>
              <small className="text-warning">Awaiting approval</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <h5>Inactive Users</h5>
              <h3>{userAccounts.filter(u => u.status === 'Inactive').length}</h3>
              <small className="text-secondary">Not active</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Accounts Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0" style={{ color: '#1e0a3c' }}>All User Accounts</h5>
            <Button variant="primary" size="sm">Add New User</Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userAccounts.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2">
                      Edit
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminAccounts;
