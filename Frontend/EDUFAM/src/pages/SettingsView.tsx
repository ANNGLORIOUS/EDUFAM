import React from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup } from 'react-bootstrap';

const SettingsView: React.FC = () => {
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header>
              <h3><i className="bi bi-gear me-2"></i>Settings</h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5>School Information</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>School Name</Form.Label>
                          <Form.Control type="text" defaultValue="EDUFAM School" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>School Address</Form.Label>
                          <Form.Control as="textarea" rows={2} defaultValue="123 Education Street, Learning City" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>School Phone</Form.Label>
                          <Form.Control type="tel" defaultValue="+254 700 000 000" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>School Email</Form.Label>
                          <Form.Control type="email" defaultValue="admin@edufamschool.edu" />
                        </Form.Group>
                        <Button variant="primary">Update School Info</Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5>System Preferences</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Academic Year</Form.Label>
                          <Form.Select defaultValue="2025">
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Current Term</Form.Label>
                          <Form.Select defaultValue="3">
                            <option value="1">Term 1</option>
                            <option value="2">Term 2</option>
                            <option value="3">Term 3</option>
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch"
                            id="notifications-switch"
                            label="Enable Email Notifications"
                            defaultChecked
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check 
                            type="switch"
                            id="sms-switch"
                            label="Enable SMS Notifications"
                            defaultChecked
                          />
                        </Form.Group>
                        <Button variant="primary">Update Preferences</Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5>USSD Services & Bulk SMS</h5>
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
                </Col>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>
                      <h5>Backup & Security</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <h6>Data Backup</h6>
                          <p className="text-muted small">Last backup: 2025-09-17 02:00 AM</p>
                          <Button variant="outline-primary" className="me-2">Create Backup</Button>
                          <Button variant="outline-secondary">Download Backup</Button>
                        </div>
                        <hr />
                        <div>
                          <h6>User Sessions</h6>
                          <p className="text-muted small">Active sessions: 24 users online</p>
                          <Button variant="outline-warning">View Active Sessions</Button>
                        </div>
                        <hr />
                        <div>
                          <h6>System Logs</h6>
                          <Button variant="outline-info" className="me-2">View System Logs</Button>
                          <Button variant="outline-secondary">Export Logs</Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SettingsView;
