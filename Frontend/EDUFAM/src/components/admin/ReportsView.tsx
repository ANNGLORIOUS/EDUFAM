import React from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';

const ReportsView: React.FC = () => {
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Header>
              <h3><i className="bi bi-file-earmark-text me-2"></i>School Reports</h3>
            </Card.Header>
            <Card.Body>
              <h6>Parent Feedback Reports</h6>
              <Button variant="outline-primary" className="mb-2">Download PDF</Button>
              <ListGroup className="mb-4">
                {(() => {
                  const feedbacks = JSON.parse(localStorage.getItem('edufam_feedbacks') || '[]');
                  if (!feedbacks.length) return <ListGroup.Item>No feedback yet.</ListGroup.Item>;
                  return feedbacks.map((fb: any, idx: number) => (
                    <ListGroup.Item key={idx}>
                      <strong>{fb.from}</strong> ({fb.class}) - {fb.concernType}<br />
                      {fb.message}
                      {fb.requestCallback && <span style={{ color: '#a83279', fontWeight: 500 }}> Requested Callback</span>}
                    </ListGroup.Item>
                  ));
                })()}
              </ListGroup>
              <h6>All Teachers, Students, Parents</h6>
              <Button variant="outline-primary" className="mb-2">Download PDF</Button>
              <ListGroup className="mb-4">
                {(() => {
                  const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
                  if (!users.length) return <ListGroup.Item>No users yet.</ListGroup.Item>;
                  return users.map((u: any) => (
                    <ListGroup.Item key={u.id}>
                      <strong>{u.name}</strong> <span className="text-muted">({u.type})</span> {u.class && <span>- Class: {u.class}</span>}
                    </ListGroup.Item>
                  ));
                })()}
              </ListGroup>
              <h6>Class Performance Reports (Uploaded by Teachers)</h6>
              <Button variant="outline-primary" className="mb-2">Download PDF</Button>
              <ListGroup className="mb-4">
                <ListGroup.Item>Class performance data coming soon.</ListGroup.Item>
              </ListGroup>
              <h6>Events Reports</h6>
              <Button variant="outline-primary" className="mb-2">Download PDF</Button>
              <ListGroup className="mb-4">
                <ListGroup.Item>Events data coming soon.</ListGroup.Item>
              </ListGroup>
              <h6>Attendance Reports (Filter by Student)</h6>
              <Button variant="outline-primary" className="mb-2">Download PDF</Button>
              <ListGroup className="mb-4">
                <ListGroup.Item>Attendance data coming soon.</ListGroup.Item>
              </ListGroup>
              <h6>Fees Overall Report (Students with Fee Balance)</h6>
              <Button variant="outline-primary" className="mb-2">Download PDF</Button>
              <ListGroup className="mb-4">
                <ListGroup.Item>Fees data coming soon.</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportsView;
