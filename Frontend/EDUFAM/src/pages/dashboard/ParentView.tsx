import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import React from 'react';
import { Row, Col, Card, Button, Form, ListGroup } from 'react-bootstrap';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const bigCalendarEvents = [
  { title: 'Maths Contest', start: new Date(2025, 8, 22, 10, 0), end: new Date(2025, 8, 22, 12, 0) },
  { title: 'Parents Meeting', start: new Date(2025, 8, 25, 14, 0), end: new Date(2025, 8, 25, 16, 0) },
];

const ParentView: React.FC = () => {
  // Logic moved from ParentDashboard, will be refactored later
  const childData = { name: "Demo Child", class: "Class 5", photo: "https://randomuser.me/api/portraits/lego/1.jpg", attendance: 95 };
  const notifications = [
    { id: 1, message: "Parent-Teacher Meeting scheduled", date: "2025-09-20", event: "Parent-Teacher Meeting", photo: "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80" },
    { id: 2, message: "Mid-term Exams coming up", date: "2025-09-15", event: "Mid-term Exams", photo: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80" },
  ];

  return (
    <>
      {/* Child Profile Section */}
      <Card className="mb-4">
        <Card.Header><h5>Child Profile</h5></Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="text-center">
              <img src={childData.photo} alt={childData.name} className="rounded-circle mb-3" style={{ width: "120px", height: "120px"}}/>
              <h4>{childData.name}</h4>
              <p className="text-muted">{childData.class}</p>
            </Col>
            <Col md={4}>
              <h6>Overall Performance</h6>
              <Button variant="primary">Download PDF</Button>
            </Col>
            <Col md={4} className="text-center">
              <h6>Attendance</h6>
              <h3>{childData.attendance}%</h3>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Fees Section */}
      <Card className="mb-4">
        <Card.Header><h5>Fee Status</h5></Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}><h6>Total Fee</h6><h4>$5000</h4></Col>
            <Col md={4}><h6>Paid Amount</h6><h4 className="text-success">$3000</h4></Col>
            <Col md={4}><h6>Due Amount</h6><h4 className="text-danger">$2000</h4></Col>
          </Row>
          <Button variant="primary" className="mt-3">Pay Now</Button>
        </Card.Body>
      </Card>

      {/* Events Calendar section */}
      <Card className="mb-4">
        <Card.Header><h5>Events Calendar</h5></Card.Header>
        <Card.Body>
          <div style={{ height: 500 }}>
            <Calendar localizer={localizer} events={bigCalendarEvents} startAccessor="start" endAccessor="end" style={{ height: 400 }} />
          </div>
        </Card.Body>
      </Card>

      {/* Feedback section */}
      <Card className="mb-4">
        <Card.Header><h5>Feedback / Request Meeting</h5></Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Concern Type</Form.Label><Form.Select><option>Academic</option></Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Message</Form.Label><Form.Control as="textarea" rows={3} /></Form.Group>
            <Button variant="primary" type="submit">Submit Feedback</Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default ParentView;
