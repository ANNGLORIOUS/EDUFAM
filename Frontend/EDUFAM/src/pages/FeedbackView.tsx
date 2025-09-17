import React from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

const FeedbackView: React.FC = () => {
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3><i className="bi bi-chat-dots me-2"></i>Parent Feedback</h3>
            </Card.Header>
            <Card.Body>
              <ListGroup>
                {(() => {
                  const feedbacks = JSON.parse(localStorage.getItem('edufam_feedbacks') || '[]');
                  if (!feedbacks.length) return <ListGroup.Item>No feedback yet.</ListGroup.Item>;
                  return feedbacks.map((fb: any, idx: number) => (
                    <ListGroup.Item key={idx}>
                      <div style={{ fontWeight: 600, color: '#1e0a3c' }}>{fb.from} ({fb.class})</div>
                      <div style={{ color: '#6c63ff', fontWeight: 500 }}>{fb.concernType}</div>
                      <div style={{ margin: '6px 0' }}>{fb.message}</div>
                      <div style={{ fontSize: '0.95em', color: '#888' }}>{new Date(fb.date).toLocaleString()}</div>
                      {fb.requestCallback && <div style={{ color: '#a83279', fontWeight: 500 }}>Requested Callback</div>}
                    </ListGroup.Item>
                  ));
                })()}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FeedbackView;
