import React from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const ResultsView: React.FC = () => {
  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h3><i className="bi bi-file-earmark-bar-graph me-2"></i>Upload Results</h3>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Class/Stream</Form.Label>
                  <Form.Select>
                    <option value="">Select class...</option>
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
                <Form.Group className="mb-3">
                  <Form.Label>Student Results (CSV or Excel)</Form.Label>
                  <Form.Control type="file" />
                </Form.Group>
                <Button variant="primary">Upload Results</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResultsView;
