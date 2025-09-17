import React, { useState } from 'react';
import { Row, Col, Button, Form, ListGroup, Tab } from 'react-bootstrap';

const TeacherView: React.FC = () => {
	const [activeKey, setActiveKey] = useState('dashboard');
	const [selectedSummaryClass, setSelectedSummaryClass] = useState("");

	return (
		<>
			<Row className="teacher-dashboard-row g-0">
				<Col md={3} className="p-0">
					<ListGroup variant="flush" className="sidebar">
						<ListGroup.Item action active={activeKey === 'dashboard'} onClick={() => setActiveKey('dashboard')}>
							<i className="bi bi-speedometer2 me-2"></i> Dashboard
						</ListGroup.Item>
						<ListGroup.Item action active={activeKey === 'results'} onClick={() => setActiveKey('results')}>
							<i className="bi bi-file-earmark-bar-graph me-2"></i> Results
						</ListGroup.Item>
						<ListGroup.Item action active={activeKey === 'events'} onClick={() => setActiveKey('events')}>
							<i className="bi bi-calendar-event me-2"></i> Events
						</ListGroup.Item>
						<ListGroup.Item action active={activeKey === 'attendance'} onClick={() => setActiveKey('attendance')}>
							<i className="bi bi-check2-square me-2"></i> Attendance
						</ListGroup.Item>
						<ListGroup.Item action active={activeKey === 'feedback'} onClick={() => setActiveKey('feedback')}>
							<i className="bi bi-chat-dots me-2"></i> Feedback
						</ListGroup.Item>
					</ListGroup>
				</Col>
				<Col md={9} className="p-4 teacher-dashboard-section">
					<div style={{ marginTop: '40px' }}>
						<Tab.Content>
							<Tab.Pane eventKey="dashboard" active={activeKey === 'dashboard'}>
								<div className="row dashboard-tab-section">
									<div className="col-md-12 mb-4">
										<Form.Group>
											<Form.Label>Choose Class to View Summary</Form.Label>
											<Form.Select value={selectedSummaryClass} onChange={e => setSelectedSummaryClass(e.target.value)} style={{ maxWidth: 300 }}>
												<option value="">Select class...</option>
												<option value="1 Ivory">Class 1 Ivory</option>
												<option value="1 Pearl">Class 1 Pearl</option>
											</Form.Select>
										</Form.Group>
									</div>
									{selectedSummaryClass && (
										<>
											<div className="col-md-6">
												<h3>Results Summary - {selectedSummaryClass}</h3>
												<p>Results summary here...</p>
											</div>
											<div className="col-md-6">
												<h3>Attendance Summary - {selectedSummaryClass}</h3>
												<p>Attendance summary here...</p>
											</div>
										</>
									)}
								</div>
							</Tab.Pane>
						</Tab.Content>
					</div>
				</Col>
			</Row>
		</>
	);
};

export default TeacherView;
