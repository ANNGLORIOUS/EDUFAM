import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const EventsView: React.FC = () => {
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3><i className="bi bi-calendar-event me-2"></i>Add School Event</h3>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Event Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter event name" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Time</Form.Label>
                  <Form.Control type="time" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Enter event description" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Event Image</Form.Label>
                  <Form.Control type="file" accept="image/*" />
                </Form.Group>
                <Button variant="primary">Add Event</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EventsView;
