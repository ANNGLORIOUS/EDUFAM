import React from 'react';
import { Row, Col, Card, ListGroup } from 'react-bootstrap';

type EdufamUser = {
  id: number;
  type: 'teacher' | 'student' | 'parent';
  name: string;
  email?: string;
  studentId?: string;
  class?: string;
  subject?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  childId?: number;
  children?: string[];
  dateAdded?: string;
  lastLogin?: string;
  parentId?: number;
  fee?: {
    totalFee: number;
    paidAmount: number;
    balance: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue';
    paymentDate: string | null;
  };
};

const AdminView: React.FC = () => {
  // Get real data from localStorage
  const users: EdufamUser[] = JSON.parse(localStorage.getItem('edufam_users') || '[]');
  const students: EdufamUser[] = users.filter((u) => u.type === 'student');
  const teachers: EdufamUser[] = users.filter((u) => u.type === 'teacher');
  // const parents = users.filter((u) => u.type === 'parent'); // Removed unused variable
  const classes = [...new Set(students.map((s) => s.class))].filter(Boolean).length;

  // Calculate real revenue based on student count (KES 30,000 per student)
  const totalRevenue = students.length * 30000;

  return (
    <>
      <Card className="mb-4" style={{ backgroundColor: 'white', border: '1px solid #dee2e6' }}>
        <Card.Body>
          <h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>Welcome, Administrator!</h2>
          <p style={{ color: '#6c63ff', fontSize: '1.1em' }}>Manage EDUFAM School efficiently with real-time data.</p>
          
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="mb-2">
                <Card.Body>
                  <h5>Students</h5>
                  <h3>{students.length}</h3>
                  <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                    {(() => {
                      if (students.length === 0) return 'No students';
                      const classCounts: Record<string, number> = {};
                      students.forEach((s) => {
                        if (s.class) classCounts[s.class] = (classCounts[s.class] || 0) + 1;
                      });
                      const highestClass = Object.entries(classCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max);
                      return `Largest: ${highestClass[0]} (${highestClass[1]})`;
                    })()}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mb-2">
                <Card.Body>
                  <h5>Teachers</h5>
                  <h3>{teachers.length}</h3>
                  <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                    {(() => {
                      if (teachers.length === 0) return 'No teachers';
                      const subjectCounts: Record<string, number> = {};
                      teachers.forEach((t) => {
                        if (t.subject) subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1;
                      });
                      if (Object.keys(subjectCounts).length === 0) return '';
                      const highestSubject = Object.entries(subjectCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max);
                      return `Most: ${highestSubject[0]} (${highestSubject[1]})`;
                    })()}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mb-2">
                <Card.Body>
                  <h5>Classes</h5>
                  <h3>{classes}</h3>
                  <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                    Active classes
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="mb-2">
                <Card.Body>
                  <h5>Revenue</h5>
                  <h3>KES {totalRevenue.toLocaleString()}</h3>
                  <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                    Based on enrolled students
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* First Row: Pending Approvals and Recent Activity */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="mb-4 h-100">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0" style={{ color: '#1e0a3c' }}>Pending Approvals</h5>
                    <span className="badge bg-success">0</span>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="text-center py-3">
                    <i className="bi bi-check-circle" style={{ fontSize: '3rem', color: '#28a745' }}></i>
                    <h6 className="mt-2">All Clear!</h6>
                    <p className="text-muted mb-0">No pending approvals at this time.</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4 h-100">
                <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Recent Activity</h5></Card.Header>
                <Card.Body>
                  <div className="text-center py-3">
                    <i className="bi bi-activity" style={{ fontSize: '3rem', color: '#6c63ff' }}></i>
                    <h6 className="mt-2">No Recent Activity</h6>
                    <p className="text-muted mb-0">System activity will appear here.</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Second Row: School Performance and Fee Summary */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="mb-4 h-100">
                <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>School Performance</h5></Card.Header>
                <Card.Body>
                  <div className="text-center py-3">
                    <i className="bi bi-graph-up" style={{ fontSize: '3rem', color: '#6c63ff' }}></i>
                    <h6 className="mt-2">Performance Data</h6>
                    <p className="text-muted mb-0">Performance reports will be available when generated.</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4 h-100">
                <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Fee Summary</h5></Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between">
                      <span>Total Expected</span>
                      <strong>KES {totalRevenue.toLocaleString()}</strong>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between">
                      <span>Students Enrolled</span>
                      <strong className="text-info">{students.length}</strong>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between">
                      <span>Fee Per Student</span>
                      <strong className="text-success">KES 30,000</strong>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>

              {/* System Alerts - Commented out for now
              <Card className="mb-4">
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0" style={{ color: '#1e0a3c' }}>System Alerts</h5>
                    <span className="badge bg-warning">{adminData.systemAlerts}</span>
                  </div>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Low attendance in Class 7 Pearl</span>
                      <span className="badge bg-warning">Alert</span>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Fee deadline approaching (Sept 25)</span>
                      <span className="badge bg-info">Reminder</span>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Server maintenance scheduled</span>
                      <span className="badge bg-secondary">Info</span>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
              */}
        </Card.Body>
      </Card>
    </>
  );
};

export default AdminView;
