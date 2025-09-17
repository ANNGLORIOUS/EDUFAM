import React from 'react';
import { Row, Col, Card, ListGroup, Button } from 'react-bootstrap';

const AdminView: React.FC = () => {
  return (
    <>
      <Card className="mb-4" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
        <Card.Body>
          <h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>Welcome, Admin!</h2>
          <p style={{ color: '#6c63ff', fontSize: '1.1em' }}>Manage your school efficiently with EDUFAM.</p>
          <Row className="mb-4">
            {(() => {
              const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
              const students = users.filter((u: any) => u.type === 'student');
              const teachers = users.filter((u: any) => u.type === 'teacher');
              const parents = users.filter((u: any) => u.type === 'parent');
              const classes = [...new Set(students.map((s: any) => s.class))].length;
              const events = 5; // Example static value
              // Demo performance data
              const performance = {
                year: '2025',
                term: 'Term 3',
                score: 78, // out of 100
                trend: 'up', // 'up' or 'down'
                pdfUrl: '/public/performance-report-2025-term3.pdf',
              };
              return (
                <>
                  <Col md={2}>
                    <Card className="mb-2">
                      <Card.Body>
                        <h5>Students</h5>
                        <h3>{students.length}</h3>
                        <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                          {(() => {
                            if (students.length === 0) return 'No students';
                            const classCounts: Record<string, number> = {};
                            students.forEach((s: any) => {
                              classCounts[s.class] = (classCounts[s.class] || 0) + 1;
                            });
                            const highestClass = Object.entries(classCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max);
                            return `Most: ${highestClass[0]} (${highestClass[1]})`;
                          })()}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={2}>
                    <Card className="mb-2">
                      <Card.Body>
                        <h5>Teachers</h5>
                        <h3>{teachers.length}</h3>
                        <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                          {(() => {
                            if (teachers.length === 0) return 'No teachers';
                            const subjectCounts: Record<string, number> = {};
                            teachers.forEach((t: any) => {
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
                  <Col md={2}>
                    <Card className="mb-2">
                      <Card.Body>
                        <h5>Parents</h5>
                        <h3>{parents.length}</h3>
                        <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                          {(() => {
                            if (parents.length === 0) return 'No parents';
                            const childrenCounts: Record<string, number> = {};
                            parents.forEach((p: any) => {
                              if (p.children && Array.isArray(p.children)) {
                                childrenCounts[p.name] = p.children.length;
                              }
                            });
                            if (Object.keys(childrenCounts).length === 0) return '';
                            const highestParent = Object.entries(childrenCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max);
                            return `Most children: ${highestParent[0]} (${highestParent[1]})`;
                          })()}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={2}>
                    <Card className="mb-2">
                      <Card.Body>
                        <h5>Classes</h5>
                        <h3>{classes}</h3>
                        <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
                          {(() => {
                            if (students.length === 0) return '';
                            const classCounts: Record<string, number> = {};
                            students.forEach((s: any) => {
                              classCounts[s.class] = (classCounts[s.class] || 0) + 1;
                            });
                            if (Object.keys(classCounts).length === 0) return '';
                            const highestClass = Object.entries(classCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max);
                            return `Largest: ${highestClass[0]} (${highestClass[1]})`;
                          })()}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={2}><Card className="mb-2"><Card.Body><h5>Events</h5><h3>{events}</h3></Card.Body></Card></Col>
                  <Col md={2}>
                    <Card className="mb-2">
                      <Card.Body>
                        <h5>Overall Performance</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.5em', fontWeight: 700 }}>{performance.score}%</span>
                          {performance.trend === 'up' ? (
                            <span style={{ color: 'green', fontSize: '1.5em' }} title="Improving">
                              <i className="bi bi-arrow-up-circle-fill"></i>
                            </span>
                          ) : (
                            <span style={{ color: 'red', fontSize: '1.5em' }} title="Declining">
                              <i className="bi bi-arrow-down-circle-fill"></i>
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.95em', color: '#6c63ff' }}>{performance.year} - {performance.term}</div>
                        <a href={performance.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9em', color: '#1e0a3c', textDecoration: 'underline' }}>View PDF Results</a>
                      </Card.Body>
                    </Card>
                  </Col>
                </>
              );
            })()}
          </Row>
          <Row>
            {/* Recent Activity & Pending Approvals */}
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Recent Activity</h5></Card.Header>
                <ListGroup>
                  <ListGroup.Item>User registrations, fee payments, feedback submissions, bulk SMS sent (demo data)</ListGroup.Item>
                </ListGroup>
              </Card>
              <Card className="mb-4">
                <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Pending Approvals</h5></Card.Header>
                <ListGroup>
                  <ListGroup.Item>Account verifications, bulk SMS approvals (demo data)</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
            {/* Notifications & Shortcuts */}
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Notifications</h5></Card.Header>
                <ListGroup>
                  <ListGroup.Item>System updates, deadlines, reminders (demo data)</ListGroup.Item>
                </ListGroup>
              </Card>
              <Card className="mb-4">
                <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Shortcuts</h5></Card.Header>
                <div className="d-flex flex-wrap gap-2 p-2">
                  <Button variant="primary">Add User</Button>
                  <Button variant="info">View Reports</Button>
                  <Button variant="success">Send Bulk SMS</Button>
                </div>
              </Card>
            </Col>
          </Row>
          <Row>
            {/* School Calendar & Fee Summary */}
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>School Calendar</h5></Card.Header>
                <ListGroup>
                  <ListGroup.Item>Upcoming events and important dates (demo data)</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Fee Summary</h5></Card.Header>
                <ListGroup>
                  <ListGroup.Item>Total fees collected, outstanding balances, students with fee balance (demo data)</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default AdminView;
