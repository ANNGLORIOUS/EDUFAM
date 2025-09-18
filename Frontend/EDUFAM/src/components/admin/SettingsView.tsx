import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Modal, Table, Badge, Alert, Nav, Tab } from 'react-bootstrap';

interface BulkSMS {
  id: number;
  message: string;
  recipientType: 'all-parents' | 'class-parents' | 'overdue-parents' | 'teachers' | 'custom';
  recipientFilter?: string; // class name or custom criteria
  recipientCount: number;
  status: 'draft' | 'approved' | 'published' | 'confirmed' | 'failed';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  confirmedAt?: string;
  deliveryStats?: {
    sent: number;
    delivered: number;
    failed: number;
  };
}

const SettingsView: React.FC = () => {
  // SMS Management State
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [activeTab, setActiveTab] = useState('sms-overview');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger' | 'warning'>('success');

  // SMS Form State
  const [smsForm, setSmsForm] = useState({
    message: '',
    recipientType: 'all-parents',
    recipientFilter: ''
  });

  // Mock SMS data - in real app, this would come from API
  const [bulkSMSList, setBulkSMSList] = useState<BulkSMS[]>([
    {
      id: 1,
      message: "Important: School will be closed tomorrow due to national holiday. Classes resume Monday.",
      recipientType: 'all-parents',
      recipientCount: 150,
      status: 'confirmed',
      createdBy: 'Admin User',
      createdAt: '2025-09-17T10:00:00Z',
      approvedBy: 'Principal',
      approvedAt: '2025-09-17T10:30:00Z',
      publishedAt: '2025-09-17T11:00:00Z',
      confirmedAt: '2025-09-17T11:05:00Z',
      deliveryStats: { sent: 150, delivered: 148, failed: 2 }
    },
    {
      id: 2,
      message: "Reminder: Fee payment deadline is Friday, September 20th. Please ensure timely payment.",
      recipientType: 'overdue-parents',
      recipientCount: 45,
      status: 'published',
      createdBy: 'Accounts Manager',
      createdAt: '2025-09-18T09:00:00Z',
      approvedBy: 'Admin User',
      approvedAt: '2025-09-18T09:15:00Z',
      publishedAt: '2025-09-18T09:30:00Z',
      deliveryStats: { sent: 45, delivered: 42, failed: 3 }
    },
    {
      id: 3,
      message: "Parent-Teacher meeting scheduled for Class 5 Ivory on Friday at 2 PM.",
      recipientType: 'class-parents',
      recipientFilter: '5 Ivory',
      recipientCount: 12,
      status: 'approved',
      createdBy: 'Teacher Mary',
      createdAt: '2025-09-18T14:00:00Z',
      approvedBy: 'Principal',
      approvedAt: '2025-09-18T14:30:00Z'
    },
    {
      id: 4,
      message: "Staff meeting tomorrow at 8 AM in the conference room.",
      recipientType: 'teachers',
      recipientCount: 25,
      status: 'draft',
      createdBy: 'Principal',
      createdAt: '2025-09-18T16:00:00Z'
    }
  ]);

  // Get users for recipient count calculation
  const users = useMemo(() => {
    return JSON.parse(localStorage.getItem('edufam_users') || '[]');
  }, []);

  // Calculate recipient count based on selection
  const calculateRecipientCount = (type: string, filter?: string): number => {
    const parents = users.filter((u: any) => u.type === 'parent');
    const teachers = users.filter((u: any) => u.type === 'teacher');
    const students = users.filter((u: any) => u.type === 'student');

    switch (type) {
      case 'all-parents':
        return parents.length;
      case 'class-parents':
        if (filter) {
          const classStudents = students.filter((s: any) => s.class === filter);
          return classStudents.length; // Assuming 1 parent per student
        }
        return 0;
      case 'overdue-parents':
        // Mock logic - in real app, calculate based on fee data
        return Math.floor(parents.length * 0.3);
      case 'teachers':
        return teachers.length;
      case 'custom':
        return 0; // Would be calculated based on custom criteria
      default:
        return 0;
    }
  };

  // SMS Statistics
  const smsStats = useMemo(() => {
    const total = bulkSMSList.length;
    const draft = bulkSMSList.filter(sms => sms.status === 'draft').length;
    const approved = bulkSMSList.filter(sms => sms.status === 'approved').length;
    const published = bulkSMSList.filter(sms => sms.status === 'published').length;
    const confirmed = bulkSMSList.filter(sms => sms.status === 'confirmed').length;
    
    const totalSent = bulkSMSList
      .filter(sms => sms.deliveryStats)
      .reduce((sum, sms) => sum + (sms.deliveryStats?.sent || 0), 0);
    
    const totalDelivered = bulkSMSList
      .filter(sms => sms.deliveryStats)
      .reduce((sum, sms) => sum + (sms.deliveryStats?.delivered || 0), 0);

    return { total, draft, approved, published, confirmed, totalSent, totalDelivered };
  }, [bulkSMSList]);

  const showMessage = (message: string, variant: 'success' | 'danger' | 'warning' = 'success') => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleSMSAction = (id: number, action: 'approve' | 'publish' | 'confirm') => {
    setBulkSMSList(prev => prev.map(sms => {
      if (sms.id === id) {
        const now = new Date().toISOString();
        switch (action) {
          case 'approve':
            return { 
              ...sms, 
              status: 'approved' as const, 
              approvedBy: 'Admin User', 
              approvedAt: now 
            };
          case 'publish':
            return { 
              ...sms, 
              status: 'published' as const, 
              publishedAt: now,
              deliveryStats: { 
                sent: sms.recipientCount, 
                delivered: Math.floor(sms.recipientCount * 0.95), 
                failed: Math.ceil(sms.recipientCount * 0.05) 
              }
            };
          case 'confirm':
            return { 
              ...sms, 
              status: 'confirmed' as const, 
              confirmedAt: now 
            };
          default:
            return sms;
        }
      }
      return sms;
    }));
    
    showMessage(`SMS ${action}d successfully!`);
  };

  const handleCreateSMS = () => {
    if (!smsForm.message.trim()) {
      showMessage('Please enter a message', 'danger');
      return;
    }

    const recipientCount = calculateRecipientCount(smsForm.recipientType, smsForm.recipientFilter);
    
    if (recipientCount === 0) {
      showMessage('No recipients found for selected criteria', 'warning');
      return;
    }

    const newSMS: BulkSMS = {
      id: Date.now(),
      message: smsForm.message,
      recipientType: smsForm.recipientType as any,
      recipientFilter: smsForm.recipientFilter || undefined,
      recipientCount,
      status: 'draft',
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };

    setBulkSMSList(prev => [newSMS, ...prev]);
    setSmsForm({ message: '', recipientType: 'all-parents', recipientFilter: '' });
    setShowSMSModal(false);
    showMessage('SMS created successfully!');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: 'secondary',
      approved: 'warning',
      published: 'info',
      confirmed: 'success',
      failed: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const getRecipientDescription = (sms: BulkSMS) => {
    switch (sms.recipientType) {
      case 'all-parents':
        return 'All Parents';
      case 'class-parents':
        return `Parents of ${sms.recipientFilter}`;
      case 'overdue-parents':
        return 'Parents with Overdue Fees';
      case 'teachers':
        return 'All Teachers';
      case 'custom':
        return 'Custom Recipients';
      default:
        return 'Unknown';
    }
  };

  return (
    <Container fluid className="mt-4">
      {showAlert && (
        <Alert variant={alertVariant} dismissible onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      )}

      {/* Main Settings Header */}
      <Card className="mb-4" style={{ backgroundColor: 'white', border: '1px solid #dee2e6' }}>
        <Card.Body>
          <h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>
            <i className="bi bi-gear me-2"></i>Settings
          </h2>
          <p style={{ color: '#6c63ff', fontSize: '1.1em', marginBottom: 0 }}>
            Manage school settings, bulk communications, and system preferences
          </p>
        </Card.Body>
      </Card>

      {/* Navigation Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'sms-overview')}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="sms-overview">
              Bulk SMS {smsStats.draft > 0 && <Badge bg="warning">{smsStats.draft}</Badge>}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="school-settings">School Settings</Nav.Link>
          </Nav.Item>
         
        </Nav>

        <Tab.Content>
          {/* Bulk SMS Management Tab */}
          <Tab.Pane eventKey="sms-overview">
            {/* SMS Statistics Cards */}
            <Row className="mb-4">
              <Col md={2}>
                <Card className="text-center" style={{ backgroundColor: '#f8f9fa' }}>
                  <Card.Body>
                    <h4 style={{ color: '#6c63ff', marginBottom: '0.5rem' }}>{smsStats.total}</h4>
                    <small>Total SMS</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center" style={{ backgroundColor: '#f8f9fa' }}>
                  <Card.Body>
                    <h4 style={{ color: '#fd7e14', marginBottom: '0.5rem' }}>{smsStats.draft}</h4>
                    <small>Draft</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center" style={{ backgroundColor: '#f8f9fa' }}>
                  <Card.Body>
                    <h4 style={{ color: '#ffc107', marginBottom: '0.5rem' }}>{smsStats.approved}</h4>
                    <small>Approved</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center" style={{ backgroundColor: '#f8f9fa' }}>
                  <Card.Body>
                    <h4 style={{ color: '#17a2b8', marginBottom: '0.5rem' }}>{smsStats.published}</h4>
                    <small>Published</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center" style={{ backgroundColor: '#f8f9fa' }}>
                  <Card.Body>
                    <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>{smsStats.confirmed}</h4>
                    <small>Confirmed</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center" style={{ backgroundColor: '#f8f9fa' }}>
                  <Card.Body>
                    <h4 style={{ color: '#007bff', marginBottom: '0.5rem' }}>{smsStats.totalDelivered}</h4>
                    <small>Delivered</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="mb-4">
              <Button variant="primary" onClick={() => setShowSMSModal(true)}>
                <i className="bi bi-plus-circle me-2"></i>Create New SMS
              </Button>
            </div>

            {/* SMS List Table */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">Bulk SMS Management</h5>
              </Card.Header>
              <Card.Body>
                {bulkSMSList.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-chat-dots" style={{ fontSize: '3rem', color: '#6c63ff' }}></i>
                    <h5 className="mt-2">No SMS messages</h5>
                    <p className="text-muted">Create your first bulk SMS message</p>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Message</th>
                        <th>Recipients</th>
                        <th>Count</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Delivery Stats</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkSMSList.map(sms => (
                        <tr key={sms.id}>
                          <td>
                            <div style={{ maxWidth: '200px' }}>
                              <strong>{sms.message.substring(0, 50)}...</strong>
                              <br />
                              <small className="text-muted">by {sms.createdBy}</small>
                            </div>
                          </td>
                          <td>{getRecipientDescription(sms)}</td>
                          <td>
                            <Badge bg="info">{sms.recipientCount}</Badge>
                          </td>
                          <td>{getStatusBadge(sms.status)}</td>
                          <td>
                            <small>{new Date(sms.createdAt).toLocaleDateString()}</small>
                          </td>
                          <td>
                            {sms.deliveryStats ? (
                              <div>
                                <small className="text-success">✓ {sms.deliveryStats.delivered}</small>
                                {sms.deliveryStats.failed > 0 && (
                                  <><br /><small className="text-danger">✗ {sms.deliveryStats.failed}</small></>
                                )}
                              </div>
                            ) : (
                              <small className="text-muted">-</small>
                            )}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {sms.status === 'draft' && (
                                <Button 
                                  variant="outline-warning" 
                                  size="sm"
                                  onClick={() => handleSMSAction(sms.id, 'approve')}
                                >
                                  Approve
                                </Button>
                              )}
                              {sms.status === 'approved' && (
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleSMSAction(sms.id, 'publish')}
                                >
                                  Publish
                                </Button>
                              )}
                              {sms.status === 'published' && (
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleSMSAction(sms.id, 'confirm')}
                                >
                                  Confirm
                                </Button>
                              )}
                              {sms.status === 'confirmed' && (
                                <Badge bg="success">Completed</Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* School Settings Tab */}
          <Tab.Pane eventKey="school-settings">
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
                    <h5>Communication Settings</h5>
                  </Card.Header>
                  <Card.Body>
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>SMS Provider</Form.Label>
                        <Form.Select>
                          <option value="africastalking">Africa's Talking</option>
                          <option value="safaricom">Safaricom</option>
                          <option value="custom">Custom Provider</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>SMS Sender ID</Form.Label>
                        <Form.Control type="text" defaultValue="EDUFAM" />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="switch"
                          id="sms-enabled"
                          label="Enable SMS Notifications"
                          defaultChecked
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check 
                          type="switch"
                          id="email-enabled"
                          label="Enable Email Notifications"
                          defaultChecked
                        />
                      </Form.Group>
                      <Button variant="primary">Update Communication Settings</Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Create SMS Modal */}
      <Modal show={showSMSModal} onHide={() => setShowSMSModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Bulk SMS</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4}
                value={smsForm.message}
                onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your SMS message..."
                maxLength={160}
              />
              <Form.Text className="text-muted">
                {smsForm.message.length}/160 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Send To</Form.Label>
              <Form.Select 
                value={smsForm.recipientType}
                onChange={(e) => setSmsForm(prev => ({ ...prev, recipientType: e.target.value, recipientFilter: '' }))}
              >
                <option value="all-parents">All Parents</option>
                <option value="class-parents">Parents of Specific Class</option>
                <option value="overdue-parents">Parents with Overdue Fees</option>
                <option value="teachers">All Teachers</option>
                <option value="custom">Custom Recipients</option>
              </Form.Select>
            </Form.Group>

            {smsForm.recipientType === 'class-parents' && (
              <Form.Group className="mb-3">
                <Form.Label>Select Class</Form.Label>
                <Form.Select 
                  value={smsForm.recipientFilter}
                  onChange={(e) => setSmsForm(prev => ({ ...prev, recipientFilter: e.target.value }))}
                >
                  <option value="">Select a class...</option>
                  <option value="1 Ivory">Class 1 Ivory</option>
                  <option value="1 Pearl">Class 1 Pearl</option>
                  <option value="2 Ivory">Class 2 Ivory</option>
                  <option value="2 Pearl">Class 2 Pearl</option>
                  <option value="3 Ivory">Class 3 Ivory</option>
                  <option value="3 Pearl">Class 3 Pearl</option>
                  <option value="4 Ivory">Class 4 Ivory</option>
                  <option value="4 Pearl">Class 4 Pearl</option>
                  <option value="5 Ivory">Class 5 Ivory</option>
                  <option value="5 Pearl">Class 5 Pearl</option>
                  <option value="6 Ivory">Class 6 Ivory</option>
                  <option value="6 Pearl">Class 6 Pearl</option>
                  <option value="7 Ivory">Class 7 Ivory</option>
                  <option value="7 Pearl">Class 7 Pearl</option>
                  <option value="8 Ivory">Class 8 Ivory</option>
                  <option value="8 Pearl">Class 8 Pearl</option>
                </Form.Select>
              </Form.Group>
            )}

            <Alert variant="info">
              <strong>Recipients: </strong>
              {calculateRecipientCount(smsForm.recipientType, smsForm.recipientFilter)} people will receive this message
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSMSModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateSMS}>
            Create SMS (Draft)
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SettingsView;
