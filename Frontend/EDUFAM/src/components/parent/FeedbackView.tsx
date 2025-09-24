import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useFeedback } from '../../context/useFeedback';
import { Card, Form, Button } from 'react-bootstrap';

const FeedbackView: React.FC = () => {
  const [concernType, setConcernType] = useState('');
  const [message, setMessage] = useState('');
  const [requestCallback, setRequestCallback] = useState(false);
  const [scheduleMeeting, setScheduleMeeting] = useState(false);
  const { user } = useAuth();
  const { addFeedback } = useFeedback();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.email) {
      alert('You must be logged in as a parent to submit feedback.');
      return;
    }
    const feedbackObj = {
      concernType,
      message,
      requestCallback,
      scheduleMeeting,
      parentEmail: user.email
    };
    console.log('[EDUFAM] Submitting feedback:', feedbackObj);
    addFeedback(feedbackObj);
    setConcernType('');
    setMessage('');
    setRequestCallback(false);
    setScheduleMeeting(false);
    alert('Feedback submitted successfully!');
  };

  return (
    <Card className="feedback-card-gradient" style={{ background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', border: 'none', boxShadow: '0 4px 24px rgba(171,71,188,0.10)' }}>
      <Card.Header style={{ background: 'transparent', border: 'none', paddingBottom: 0 }}>
        <h5 className="mb-0" style={{ color: '#1e0a3c', fontWeight: 700, letterSpacing: 0.5 }}>Feedback / Request Meeting</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#a83279', fontWeight: 600 }}>Concern Type</Form.Label>
            <Form.Select
              style={{ background: '#fff', border: '1.5px solid #a83279', borderRadius: 10, color: '#6c63ff', fontWeight: 500 }}
              value={concernType}
              onChange={(e) => setConcernType(e.target.value)}
              required
            >
              <option value="">Select concern type...</option>
              <option value="academic">Academic</option>
              <option value="behavior">Behavior</option>
              <option value="health">Health</option>
              <option value="attendance">Attendance</option>
              <option value="general">General Inquiry</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#a83279', fontWeight: 600 }}>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              style={{ background: '#fff', border: '1.5px solid #a83279', borderRadius: 10, color: '#6c63ff', fontWeight: 500 }}
              placeholder="Please describe your concern or feedback..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Request Callback"
              style={{ color: '#a83279', fontWeight: 500 }}
              checked={requestCallback}
              onChange={(e) => setRequestCallback(e.target.checked)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Schedule Meeting"
              style={{ color: '#a83279', fontWeight: 500 }}
              checked={scheduleMeeting}
              onChange={(e) => setScheduleMeeting(e.target.checked)}
            />
          </Form.Group>
          <Button variant="primary" type="submit" style={{
            background: 'linear-gradient(90deg, #a83279 0%, #6c63ff 100%)',
            border: 'none',
            borderRadius: 20,
            fontWeight: 700,
            fontSize: '1.08rem',
            letterSpacing: 0.5,
            padding: '0.6rem 1.4rem',
            boxShadow: '0 2px 8px rgba(171,71,188,0.10)',
            color: '#fff',
            transition: 'all 0.2s',
          }}>
            Submit Feedback
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FeedbackView;
