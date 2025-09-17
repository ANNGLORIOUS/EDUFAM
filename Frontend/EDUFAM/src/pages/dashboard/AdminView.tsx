import React, { useState } from 'react';
import { Row, Col, Card, ListGroup, Button } from 'react-bootstrap';

type EdufamUser = {
  id: number;
  type: 'teacher' | 'student' | 'parent';
  name: string;
  email: string;
  class?: string;
  status?: 'pending' | 'approved' | 'rejected';
  childId?: number; // For parents, link to child
};

const AdminView: React.FC = () => {
  // All the state and handlers from the old component are here for now
  // They will be refactored to use services later.

  return (
    <>
      <Card className="mb-4" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)', border: 'none', boxShadow: '0 4px 24px rgba(108,99,255,0.10)' }}>
        <Card.Body>
          <h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>Welcome, Admin!</h2>
          <p style={{ color: '#6c63ff', fontSize: '1.1em' }}>Manage your school efficiently with EDUFAM.</p>
          <Row className="mb-4">
            {(() => {
              const users: EdufamUser[] = JSON.parse(localStorage.getItem('edufam_users') || '[]');
              const students = users.filter((u) => u.type === 'student');
              const teachers = users.filter((u) => u.type === 'teacher');
              const parents = users.filter((u) => u.type === 'parent');
              const classes = [...new Set(students.map((s) => s.class))].length;
              const events = 5; // Example static value
              const performance = {
                year: '2025',
                term: 'Term 3',
                score: 78,
                trend: 'up',
                pdfUrl: '/public/performance-report-2025-term3.pdf',
              };
              return (
                <>
                  <Col md={2}><Card className="mb-2"><Card.Body><h5>Students</h5><h3>{students.length}</h3></Card.Body></Card></Col>
                  <Col md={2}><Card className="mb-2"><Card.Body><h5>Teachers</h5><h3>{teachers.length}</h3></Card.Body></Card></Col>
                  <Col md={2}><Card className="mb-2"><Card.Body><h5>Parents</h5><h3>{parents.length}</h3></Card.Body></Card></Col>
                  <Col md={2}><Card className="mb-2"><Card.Body><h5>Classes</h5><h3>{classes}</h3></Card.Body></Card></Col>
                  <Col md={2}><Card className="mb-2"><Card.Body><h5>Events</h5><h3>{events}</h3></Card.Body></Card></Col>
                  <Col md={2}>
                    <Card className="mb-2">
                      <Card.Body>
                        <h5>Overall Performance</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.5em', fontWeight: 700 }}>{performance.score}%</span>
                          {performance.trend === 'up' ? (
                            <span style={{ color: 'green', fontSize: '1.5em' }} title="Improving"><i className="bi bi-arrow-up-circle-fill"></i></span>
                          ) : (
                            <span style={{ color: 'red', fontSize: '1.5em' }} title="Declining"><i className="bi bi-arrow-down-circle-fill"></i></span>
                          )}
                        </div>
                        <a href={performance.pdfUrl} target="_blank" rel="noopener noreferrer">View PDF Results</a>
                      </Card.Body>
                    </Card>
                  </Col>
                </>
              );
            })()}
          </Row>
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header><h5 className="mb-0">Recent Activity</h5></Card.Header>
                <ListGroup><ListGroup.Item>Demo data: User registrations, fee payments, etc.</ListGroup.Item></ListGroup>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header><h5 className="mb-0">Shortcuts</h5></Card.Header>
                <div className="d-flex flex-wrap gap-2 p-2">
                  <Button variant="primary">Add User</Button>
                  <Button variant="info">View Reports</Button>
                  <Button variant="success">Send Bulk SMS</Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default AdminView;
