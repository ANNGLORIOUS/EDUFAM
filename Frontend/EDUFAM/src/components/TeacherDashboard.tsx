import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, ListGroup, Tab } from 'react-bootstrap';

const TeacherDashboard: React.FC = () => {
	const [activeKey, setActiveKey] = useState('dashboard');
	// const [eventTarget, setEventTarget] = useState('class');
	// const [eventClass, setEventClass] = useState('');

	return (
		<>
			<Container fluid className="my-4">
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
							<ListGroup.Item action active={activeKey === 'fees'} onClick={() => setActiveKey('fees')}>
								<i className="bi bi-cash-stack me-2"></i> Fees
							</ListGroup.Item>
						</ListGroup>
					</Col>
					<Col md={9} className="p-4 teacher-dashboard-section">
						<Tab.Content>
							<Tab.Pane eventKey="dashboard" active={activeKey === 'dashboard'}>
								<div className="row dashboard-tab-section">
									<div className="col-md-6">
										<h3>Results Summary</h3>
										<table className="table table-bordered">
											<thead>
												<tr>
													<th>Class/Stream</th>
													<th>Latest Results</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>None</td>
													<td>None</td>
												</tr>
											</tbody>
										</table>
										<h3>Events Summary</h3>
										<table className="table table-bordered">
											<thead>
												<tr>
													<th>Event Name</th>
													<th>Date</th>
													<th>Description</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>None</td>
													<td>None</td>
													<td>None</td>
												</tr>
											</tbody>
										</table>
									</div>
									<div className="col-md-6">
										<h3>Attendance Summary</h3>
										<table className="table table-bordered">
											<thead>
												<tr>
													<th>Student Name</th>
													<th>Class</th>
													<th>Attendance (%)</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>None</td>
													<td>None</td>
													<td>None</td>
												</tr>
											</tbody>
										</table>
										<h3>Fees Summary</h3>
										<table className="table table-bordered">
											<thead>
												<tr>
													<th>Student Name</th>
													<th>Class</th>
													<th>Amount Due</th>
													<th>Balance</th>
													<th>Due Date</th>
												</tr>
											</thead>
											<tbody>
												<tr>
													<td>None</td>
													<td>None</td>
													<td>None</td>
													<td>None</td>
													<td>None</td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</Tab.Pane>
							<Tab.Pane eventKey="results" active={activeKey === 'results'}>
								<h3>Upload Results</h3>
								<Form>
									<Form.Group className="mb-3">
										<Form.Label>Class/Stream</Form.Label>
										<Form.Control type="text" placeholder="Enter class or stream" />
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Student Results (CSV or Excel)</Form.Label>
										<Form.Control type="file" />
									</Form.Group>
									<Button variant="primary">Upload Results</Button>
								</Form>
							</Tab.Pane>
							<Tab.Pane eventKey="events" active={activeKey === 'events'}>
								<h3>Add School Event</h3>
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
							</Tab.Pane>
							<Tab.Pane eventKey="attendance" active={activeKey === 'attendance'}>
								<h3>Attendance</h3>
								<Form>
									<Form.Group className="mb-3">
										<Form.Label>Student Name</Form.Label>
										<Form.Control type="text" placeholder="Enter student name" />
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Class/Stream</Form.Label>
										<Form.Control type="text" placeholder="Enter class or stream" />
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Week</Form.Label>
										<Form.Control type="week" />
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Mark Attendance</Form.Label>
										<div style={{ display: 'flex', gap: '8px' }}>
											<Form.Check type="checkbox" label="Mon" />
											<Form.Check type="checkbox" label="Tue" />
											<Form.Check type="checkbox" label="Wed" />
											<Form.Check type="checkbox" label="Thu" />
											<Form.Check type="checkbox" label="Fri" />
										</div>
									</Form.Group>
									<Button variant="primary">Upload Attendance</Button>
								</Form>
							</Tab.Pane>
							<Tab.Pane eventKey="fees" active={activeKey === 'fees'}>
								<h3>Fees</h3>
								<Form>
									<Form.Group className="mb-3">
										<Form.Label>Student Name</Form.Label>
										<Form.Control type="text" placeholder="Enter student name" />
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Class</Form.Label>
										<Form.Control type="text" placeholder="Enter class" />
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Parent Email</Form.Label>
										<Form.Control type="email" placeholder="Enter parent email" />
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Due Date</Form.Label>
										<Form.Control type="date" />
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Amount to be Paid</Form.Label>
										<Form.Control type="number" placeholder="Enter total amount" />
									</Form.Group>
									<Form.Group className="mb-3">
										<Form.Label>Balance Remaining</Form.Label>
										<Form.Control type="number" placeholder="Enter balance remaining" />
									</Form.Group>
									<Button variant="primary">Submit to Parent Dashboard</Button>
								</Form>
							</Tab.Pane>
						</Tab.Content>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default TeacherDashboard;
