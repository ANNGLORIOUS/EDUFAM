import React, { useState } from 'react';
import { Row, Col, Card, ListGroup, Button, Form } from 'react-bootstrap';

const TeacherView: React.FC = () => {
	const [selectedSummaryClass, setSelectedSummaryClass] = useState("");

	// Mock teacher data - replace with real auth data
	const teacherData = {
		name: "Mrs. Sarah Johnson",
		subject: "Mathematics",
		classes: ["5 Ivory", "5 Pearl", "6 Ivory"],
		totalStudents: 85,
		averageAttendance: 94,
		pendingAssignments: 12,
		upcomingTests: 3
	};

	return (
		<>
			<Card className="mb-4" style={{ background: '#ffffff', border: '1px solid #e9ecef', boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)' }}>
				<Card.Body>
					<h2 style={{ color: '#1e0a3c', fontWeight: 700 }}>Welcome, {teacherData.name}!</h2>
					<p style={{ color: '#6c757d', fontSize: '1.1em' }}>Manage your classes and students efficiently.</p>
					
					{/* Summary Cards */}
					<Row className="mb-4">
						<Col md={3}>
							<Card className="mb-2">
								<Card.Body>
									<h5>My Classes</h5>
									<h3>{teacherData.classes.length}</h3>
									<div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
										Subject: {teacherData.subject}
									</div>
								</Card.Body>
							</Card>
						</Col>
						<Col md={3}>
							<Card className="mb-2">
								<Card.Body>
									<h5>Total Students</h5>
									<h3>{teacherData.totalStudents}</h3>
									<div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
										Across all classes
									</div>
								</Card.Body>
							</Card>
						</Col>
						<Col md={3}>
							<Card className="mb-2">
								<Card.Body>
									<h5>Avg Attendance</h5>
									<h3>{teacherData.averageAttendance}%</h3>
									<div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
										This month
									</div>
								</Card.Body>
							</Card>
						</Col>
						<Col md={3}>
							<Card className="mb-2">
								<Card.Body>
									<h5>Pending Tasks</h5>
									<h3>{teacherData.pendingAssignments}</h3>
									<div style={{ fontSize: '0.95em', color: '#6c63ff' }}>
										Assignments to grade
									</div>
								</Card.Body>
							</Card>
						</Col>
					</Row>

					<Row>
						{/* Quick Actions & Today's Schedule */}
						<Col md={6}>
							<Card className="mb-4">
								<Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Quick Actions</h5></Card.Header>
								<div className="d-flex flex-wrap gap-2 p-3">
									<Button variant="primary" size="sm">Take Attendance</Button>
									<Button style={{ backgroundColor: '#6c63ff', borderColor: '#6c63ff' }} size="sm">Grade Assignments</Button>
									<Button variant="info" size="sm">Create Test</Button>
									<Button variant="warning" size="sm">Send Notice</Button>
									<Button variant="secondary" size="sm">View Reports</Button>
								</div>
							</Card>
							
							<Card className="mb-4">
								<Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Today's Schedule</h5></Card.Header>
								<ListGroup variant="flush">
									<ListGroup.Item>
										<strong>9:00 AM - 10:00 AM:</strong> Mathematics - Class 5 Ivory
									</ListGroup.Item>
									<ListGroup.Item>
										<strong>11:00 AM - 12:00 PM:</strong> Mathematics - Class 5 Pearl
									</ListGroup.Item>
									<ListGroup.Item>
										<strong>2:00 PM - 3:00 PM:</strong> Mathematics - Class 6 Ivory
									</ListGroup.Item>
								</ListGroup>
							</Card>
						</Col>

						{/* Notifications & Recent Activity */}
						<Col md={6}>
							<Card className="mb-4">
								<Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Notifications</h5></Card.Header>
								<ListGroup variant="flush">
									<ListGroup.Item>
										<div className="d-flex justify-content-between">
											<span>Parent meeting request from John's parent</span>
											<small className="text-muted">2 hours ago</small>
										</div>
									</ListGroup.Item>
									<ListGroup.Item>
										<div className="d-flex justify-content-between">
											<span>Assignment submission deadline reminder</span>
											<small className="text-muted">1 day ago</small>
										</div>
									</ListGroup.Item>
									<ListGroup.Item>
										<div className="d-flex justify-content-between">
											<span>New student added to Class 5 Pearl</span>
											<small className="text-muted">3 days ago</small>
										</div>
									</ListGroup.Item>
								</ListGroup>
							</Card>

							<Card className="mb-4">
								<Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Upcoming Events</h5></Card.Header>
								<ListGroup variant="flush">
									<ListGroup.Item>
										<div className="d-flex justify-content-between">
											<span><strong>Parent-Teacher Meeting</strong></span>
											<small className="text-muted">Sept 20, 2025</small>
										</div>
									</ListGroup.Item>
									<ListGroup.Item>
										<div className="d-flex justify-content-between">
											<span><strong>Mathematics Quiz</strong></span>
											<small className="text-muted">Sept 25, 2025</small>
										</div>
									</ListGroup.Item>
									<ListGroup.Item>
										<div className="d-flex justify-content-between">
											<span><strong>Mid-term Exams</strong></span>
											<small className="text-muted">Oct 5-10, 2025</small>
										</div>
									</ListGroup.Item>
								</ListGroup>
							</Card>
						</Col>
					</Row>

					{/* Class Details Section */}
					<Row>
						<Col md={12}>
							<Card className="mb-4">
								<Card.Header><h5 className="mb-0" style={{ color: '#1e0a3c' }}>Class Details</h5></Card.Header>
								<Card.Body>
									<Form.Group className="mb-3">
										<Form.Label>Choose Class to View Summary</Form.Label>
										<Form.Select 
											value={selectedSummaryClass} 
											onChange={e => setSelectedSummaryClass(e.target.value)} 
											style={{ maxWidth: 300 }}
										>
											<option value="">Select class...</option>
											{teacherData.classes.map(cls => (
												<option key={cls} value={cls}>Class {cls}</option>
											))}
										</Form.Select>
									</Form.Group>
									
									{selectedSummaryClass && (
										<Row>
											<Col md={6}>
												<h6>Recent Results - {selectedSummaryClass}</h6>
												<div className="table-responsive">
													<table className="table table-sm table-bordered">
														<thead>
															<tr>
																<th>Student ID</th>
																<th>Student Name</th>
																<th>Latest Grade</th>
															</tr>
														</thead>
														<tbody>
															<tr>
																<td>12A</td>
																<td>Jane Doe</td>
																<td><span className="badge" style={{ backgroundColor: '#6c63ff', color: 'white' }}>A</span></td>
															</tr>
															<tr>
																<td>12B</td>
																<td>John Smith</td>
																<td><span className="badge bg-primary">B+</span></td>
															</tr>
															<tr>
																<td>12C</td>
																<td>Emma Wilson</td>
																<td><span className="badge" style={{ backgroundColor: '#667eea', color: 'white' }}>A-</span></td>
															</tr>
														</tbody>
													</table>
												</div>
											</Col>
											<Col md={6}>
												<h6>Attendance Overview - {selectedSummaryClass}</h6>
												<div className="table-responsive">
													<table className="table table-sm table-bordered">
														<thead>
															<tr>
																<th>Student ID</th>
																<th>Student Name</th>
																<th>Attendance</th>
															</tr>
														</thead>
														<tbody>
															<tr>
																<td>12A</td>
																<td>Jane Doe</td>
																<td><span className="badge" style={{ backgroundColor: '#6c63ff', color: 'white' }}>98%</span></td>
															</tr>
															<tr>
																<td>12B</td>
																<td>John Smith</td>
																<td><span className="badge bg-warning">85%</span></td>
															</tr>
															<tr>
																<td>12C</td>
																<td>Emma Wilson</td>
																<td><span className="badge" style={{ backgroundColor: '#667eea', color: 'white' }}>95%</span></td>
															</tr>
														</tbody>
													</table>
												</div>
											</Col>
										</Row>
									)}
								</Card.Body>
							</Card>
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</>
	);
};

export default TeacherView;
