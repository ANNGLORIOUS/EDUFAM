import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert, Nav, Tab, InputGroup } from 'react-bootstrap';

interface FeeRecord {
  id: number;
  studentName: string;
  studentClass: string;
  parentName: string;
  totalFee: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
}

const AccountsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('2025-term-3');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger'>('success');

  const showMessage = (message: string, variant: 'success' | 'danger' = 'success') => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Generate fee records based on users
  const feeRecords = useMemo((): FeeRecord[] => {
    const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
    const students = users.filter((u: any) => u.type === 'student');
    
    return students.map((student: any) => {
      const parent = users.find((u: any) => u.childId === student.id);
      const totalFee = 30000;
      const paidAmount = Math.floor(Math.random() * 35000); // Random payment amount
      const balance = Math.max(0, totalFee - paidAmount);
      const dueDate = '2025-09-30';
      
      let status: 'paid' | 'pending' | 'overdue' = 'pending';
      if (balance === 0) status = 'paid';
      else if (new Date(dueDate) < new Date()) status = 'overdue';
      
      return {
        id: student.id,
        studentName: student.name,
        studentClass: student.class || 'Not Assigned',
        parentName: parent?.name || 'Not Linked',
        totalFee,
        paidAmount,
        balance,
        dueDate,
        status,
        paymentDate: status === 'paid' ? '2025-09-10' : undefined
      };
    });
  }, []);

  // Filtered records based on search and filter
  const filteredRecords = useMemo(() => {
    return feeRecords.filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.studentClass.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [feeRecords, searchTerm, filterStatus]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStudents = feeRecords.length;
    const totalRevenue = feeRecords.reduce((sum, record) => sum + record.totalFee, 0);
    const totalCollected = feeRecords.reduce((sum, record) => sum + record.paidAmount, 0);
    const totalOutstanding = feeRecords.reduce((sum, record) => sum + record.balance, 0);
    const overdueCount = feeRecords.filter(record => record.status === 'overdue').length;
    const paidCount = feeRecords.filter(record => record.status === 'paid').length;
    
    return {
      totalStudents,
      totalRevenue,
      totalCollected,
      totalOutstanding,
      overdueCount,
      paidCount,
      collectionRate: totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0
    };
  }, [feeRecords]);

  const handleSendReminder = (recordId: number) => {
    const record = feeRecords.find(r => r.id === recordId);
    if (record) {
      showMessage(`Fee reminder sent to ${record.parentName} for ${record.studentName}`);
    }
  };

  const handleBulkReminders = () => {
    const overdueRecords = feeRecords.filter(r => r.status === 'overdue' || r.status === 'pending');
    showMessage(`Fee reminders sent to ${overdueRecords.length} parents`);
  };

  const handleExportData = () => {
    showMessage('Fee data exported successfully');
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
          <Row className="align-items-center mb-3">
            <Col>
              <h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>
                <i className="bi bi-wallet2 me-2"></i>Accounts & Fees
              </h2>
              <p style={{ color: '#6c63ff', fontSize: '1.1em', marginBottom: 0 }}>
                Manage student fees and financial records
              </p>
            </Col>
            <Col md="auto">
              <Form.Select 
                value={selectedTerm} 
                onChange={(e) => setSelectedTerm(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="2025-term-1">2025 Term 1</option>
                <option value="2025-term-2">2025 Term 2</option>
                <option value="2025-term-3">2025 Term 3</option>
              </Form.Select>
            </Col>
          </Row>
          
          <Row>
            <Col md={3}>
              <Card className="text-center mb-2" style={{ backgroundColor: '#f8f9fa' }}>
                <Card.Body>
                  <h3 style={{ color: '#6c63ff', marginBottom: '0.5rem' }}>
                    KES {stats.totalRevenue.toLocaleString()}
                  </h3>
                  <span style={{ color: '#1e0a3c', fontWeight: 600 }}>Total Revenue</span>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-2" style={{ backgroundColor: '#f8f9fa' }}>
                <Card.Body>
                  <h3 style={{ color: '#28a745', marginBottom: '0.5rem' }}>
                    KES {stats.totalCollected.toLocaleString()}
                  </h3>
                  <span style={{ fontSize: '0.9em' }}>Collected</span>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-2" style={{ backgroundColor: '#f8f9fa' }}>
                <Card.Body>
                  <h3 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>
                    KES {stats.totalOutstanding.toLocaleString()}
                  </h3>
                  <span style={{ fontSize: '0.9em' }}>Outstanding</span>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center mb-2" style={{ backgroundColor: '#f8f9fa' }}>
                <Card.Body>
                  <h3 style={{ color: '#fd7e14', marginBottom: '0.5rem' }}>
                    {stats.collectionRate}%
                  </h3>
                  <span style={{ fontSize: '0.9em' }}>Collection Rate</span>
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
            <Nav.Link eventKey="overview">Fee Overview</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="records">Fee Records</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="overdue">
              Overdue {stats.overdueCount > 0 && <Badge bg="danger">{stats.overdueCount}</Badge>}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="reports">Reports</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Overview Tab */}
          <Tab.Pane eventKey="overview">
            <Row>
              <Col md={8}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Recent Fee Activities</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Class</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeRecords.slice(0, 5).map(record => (
                          <tr key={record.id}>
                            <td><strong>{record.studentName}</strong></td>
                            <td>{record.studentClass}</td>
                            <td>KES {record.paidAmount.toLocaleString()}</td>
                            <td>
                              <Badge bg={
                                record.status === 'paid' ? 'success' : 
                                record.status === 'overdue' ? 'danger' : 'warning'
                              }>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </Badge>
                            </td>
                            <td>{record.paymentDate || record.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Quick Actions</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-2">
                      <Button variant="primary" onClick={handleBulkReminders}>
                        <i className="bi bi-envelope me-2"></i>Send Bulk Reminders
                      </Button>
                      <Button variant="secondary" onClick={handleExportData}>
                        <i className="bi bi-download me-2"></i>Export Fee Data
                      </Button>
                      <Button variant="outline-primary">
                        <i className="bi bi-graph-up me-2"></i>View Analytics
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Summary</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-2">
                      <small className="text-muted">Total Students</small>
                      <div className="fw-bold">{stats.totalStudents}</div>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Paid in Full</small>
                      <div className="fw-bold text-success">{stats.paidCount}</div>
                    </div>
                    <div>
                      <small className="text-muted">Overdue</small>
                      <div className="fw-bold text-danger">{stats.overdueCount}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Fee Records Tab */}
          <Tab.Pane eventKey="records">
            <Card>
              <Card.Header>
                <Row className="align-items-center">
                  <Col>
                    <h5 className="mb-0">All Fee Records</h5>
                  </Col>
                  <Col md={4}>
                    <InputGroup>
                      <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search students, parents, or class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Col>
                  <Col md={2}>
                    <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-receipt" style={{ fontSize: '3rem', color: '#6c63ff' }}></i>
                    <h5 className="mt-2">No fee records found</h5>
                    <p className="text-muted">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No fee records available'}
                    </p>
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Class</th>
                        <th>Parent</th>
                        <th>Total Fee</th>
                        <th>Paid</th>
                        <th>Balance</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map(record => (
                        <tr key={record.id}>
                          <td><strong>{record.studentName}</strong></td>
                          <td>{record.studentClass}</td>
                          <td>{record.parentName}</td>
                          <td>KES {record.totalFee.toLocaleString()}</td>
                          <td>KES {record.paidAmount.toLocaleString()}</td>
                          <td>
                            <span className={record.balance > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                              KES {record.balance.toLocaleString()}
                            </span>
                          </td>
                          <td>{record.dueDate}</td>
                          <td>
                            <Badge bg={
                              record.status === 'paid' ? 'success' : 
                              record.status === 'overdue' ? 'danger' : 'warning'
                            }>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </td>
                          <td>
                            {record.status !== 'paid' && (
                              <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={() => handleSendReminder(record.id)}
                              >
                                <i className="bi bi-envelope"></i>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Overdue Tab */}
          <Tab.Pane eventKey="overdue">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Overdue Payments</h5>
              </Card.Header>
              <Card.Body>
                {feeRecords.filter(record => record.status === 'overdue').length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-check-circle" style={{ fontSize: '3rem', color: '#28a745' }}></i>
                    <h5 className="mt-2">No overdue payments</h5>
                    <p className="text-muted">All fee payments are up to date</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-3">
                      <Button variant="warning" onClick={handleBulkReminders}>
                        <i className="bi bi-envelope me-2"></i>Send Reminders to All Overdue
                      </Button>
                    </div>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Class</th>
                          <th>Parent</th>
                          <th>Amount Due</th>
                          <th>Days Overdue</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeRecords
                          .filter(record => record.status === 'overdue')
                          .map(record => {
                            const daysOverdue = Math.floor((new Date().getTime() - new Date(record.dueDate).getTime()) / (1000 * 3600 * 24));
                            return (
                              <tr key={record.id}>
                                <td><strong>{record.studentName}</strong></td>
                                <td>{record.studentClass}</td>
                                <td>{record.parentName}</td>
                                <td className="text-danger fw-bold">
                                  KES {record.balance.toLocaleString()}
                                </td>
                                <td>
                                  <Badge bg="danger">{daysOverdue} days</Badge>
                                </td>
                                <td>
                                  <Button 
                                    variant="outline-warning" 
                                    size="sm"
                                    onClick={() => handleSendReminder(record.id)}
                                  >
                                    <i className="bi bi-envelope me-1"></i>Remind
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Reports Tab */}
          <Tab.Pane eventKey="reports">
            <Row>
              <Col md={6}>
                <Card className="mb-3">
                  <Card.Header>
                    <h6 className="mb-0">Financial Reports</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-2">
                      <Button variant="outline-primary" onClick={handleExportData}>
                        <i className="bi bi-file-earmark-excel me-2"></i>Monthly Fee Report
                      </Button>
                      <Button variant="outline-primary" onClick={handleExportData}>
                        <i className="bi bi-file-earmark-pdf me-2"></i>Outstanding Balances
                      </Button>
                      <Button variant="outline-primary" onClick={handleExportData}>
                        <i className="bi bi-file-earmark-text me-2"></i>Payment History
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Analytics</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <small className="text-muted">Collection Efficiency</small>
                      <div className="progress mt-1">
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: `${stats.collectionRate}%` }}
                        ></div>
                      </div>
                      <small>{stats.collectionRate}% of students have paid in full</small>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted">Revenue vs Target</small>
                      <div className="progress mt-1">
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                      <small>75% of target revenue achieved</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default AccountsView;
