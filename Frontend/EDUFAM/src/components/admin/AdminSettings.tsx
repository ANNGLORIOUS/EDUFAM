import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Alert, ListGroup } from 'react-bootstrap';

const AdminSettings: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: 'EDUFAM School',
    schoolEmail: 'admin@edufam.com',
    schoolPhone: '+1-234-567-8900',
    schoolAddress: '123 Education Street, Learning City, LC 12345',
    academicYear: '2025',
    currentTerm: 'Term 3',
    enableNotifications: true,
    enableSMS: true,
    autoBackup: true,
    maintenanceMode: false
  });

  const handleSave = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="admin-settings">
      <Row className="mb-4">
        <Col>
          <h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>System Settings</h2>
          <p style={{ color: '#6c63ff' }}>Configure and manage EDUFAM system settings.</p>
        </Col>
      </Row>

      {showAlert && (
        <Alert variant="success" className="mb-4">
          Settings saved successfully!
        </Alert>
      )}

      <Row>
        {/* School Information */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0" style={{ color: '#1e0a3c' }}>School Information</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>School Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={settings.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>School Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={settings.schoolEmail}
                    onChange={(e) => handleInputChange('schoolEmail', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>School Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={settings.schoolPhone}
                    onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>School Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={settings.schoolAddress}
                    onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Academic Settings */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0" style={{ color: '#1e0a3c' }}>Academic Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Academic Year</Form.Label>
                  <Form.Select
                    value={settings.academicYear}
                    onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Current Term</Form.Label>
                  <Form.Select
                    value={settings.currentTerm}
                    onChange={(e) => handleInputChange('currentTerm', e.target.value)}
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>

          {/* System Settings */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0" style={{ color: '#1e0a3c' }}>System Configuration</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Email Notifications</strong>
                    <br />
                    <small className="text-muted">Send email notifications to users</small>
                  </div>
                  <Form.Check
                    type="switch"
                    checked={settings.enableNotifications}
                    onChange={(e) => handleInputChange('enableNotifications', e.target.checked)}
                  />
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>SMS Notifications</strong>
                    <br />
                    <small className="text-muted">Send SMS alerts to parents</small>
                  </div>
                  <Form.Check
                    type="switch"
                    checked={settings.enableSMS}
                    onChange={(e) => handleInputChange('enableSMS', e.target.checked)}
                  />
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Auto Backup</strong>
                    <br />
                    <small className="text-muted">Automatically backup data daily</small>
                  </div>
                  <Form.Check
                    type="switch"
                    checked={settings.autoBackup}
                    onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                  />
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Maintenance Mode</strong>
                    <br />
                    <small className="text-muted">Temporarily disable system access</small>
                  </div>
                  <Form.Check
                    type="switch"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                  />
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Save Button */}
      <Row>
        <Col>
          <Card>
            <Card.Body className="text-center">
              <Button variant="primary" size="lg" onClick={handleSave}>
                Save All Settings
              </Button>
              <Button variant="outline-secondary" size="lg" className="ms-3">
                Reset to Defaults
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminSettings;
