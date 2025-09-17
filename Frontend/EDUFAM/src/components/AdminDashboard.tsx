import React from 'react';
import CustomNavbar from './Navbar';
import Footer from './Footer';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

const AdminDashboard: React.FC = () => {
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
                <ListGroup.Item action>Dashboard Home</ListGroup.Item>
                <ListGroup.Item action>Manage Users</ListGroup.Item>
                <ListGroup.Item action>School Reports</ListGroup.Item>
                <ListGroup.Item action>Settings</ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
          <Col md={9}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700 }}>Admin Dashboard</h5>
              </Card.Header>
              <Card.Body>
                <h4>Welcome, Admin!</h4>
                <p>Use the sidebar to manage users, view reports, and configure school settings.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default AdminDashboard;
