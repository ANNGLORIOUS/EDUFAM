import React, { useState } from 'react';
import { useEvents } from '../context/useEvents';
import { useResults } from '../context/ResultsContextHook';
import { Container, Row, Col, Button, Form, ListGroup, Tab } from 'react-bootstrap';
import { useAttendance } from '../context/AttendanceContextHook';

const TeacherDashboard: React.FC = () => {
	const [activeKey, setActiveKey] = useState('dashboard');
	const [selectedSummaryClass, setSelectedSummaryClass] = useState("");
	const { addEvent } = useEvents();
	const { addResult } = useResults();
	const { addAttendance } = useAttendance();

	// State for event form, now includes image
	const [eventForm, setEventForm] = useState({
		title: '',
		date: '',
		time: '',
		description: '',
	});

	const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setEventForm({ ...eventForm, [name]: value });
	};

	const handleAddEvent = (e: React.FormEvent) => {
		e.preventDefault();
		if (!eventForm.title || !eventForm.date || !eventForm.time) return;
		const [hour, minute] = eventForm.time.split(':').map(Number);
		const start = new Date(eventForm.date);
		start.setHours(hour, minute, 0, 0);
		const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
		addEvent({
			title: eventForm.title,
			start,
			end,
			description: eventForm.description,
		});
		setEventForm({ title: '', date: '', time: '', description: ''});
		alert('Event added! It will appear in the Parent Dashboard.');
	};

	// State for results upload
	const [resultsForm, setResultsForm] = useState({
		studentName: '',
		studentId: '',
		studentClass: '',
		term: '',
		fileName: '',
		fileDataUrl: '',
	});

	const handleResultsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setResultsForm({ ...resultsForm, [name]: value });
	};
	const handleResultsSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setResultsForm({ ...resultsForm, [name]: value });
	};

	const handleResultsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files && e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setResultsForm(prev => ({ ...prev, fileName: file.name, fileDataUrl: reader.result as string }));
			};
			reader.readAsDataURL(file);
		}
	};

	const handleResultsUpload = (e: React.FormEvent) => {
		e.preventDefault();
		if (!resultsForm.studentName || !resultsForm.studentId || !resultsForm.studentClass || !resultsForm.term || !resultsForm.fileDataUrl) {
			alert('Please fill all required fields and upload a results file.');
			return;
		}
		addResult({
			studentName: resultsForm.studentName,
			studentId: resultsForm.studentId,
			studentClass: resultsForm.studentClass,
			term: resultsForm.term,
			fileName: resultsForm.fileName,
			fileDataUrl: resultsForm.fileDataUrl,
		});
		setResultsForm({ studentName: '', studentId: '', studentClass: '', term: '', fileName: '', fileDataUrl: '' });
		alert('Results uploaded! They will appear in the Parent Dashboard.');
	};

	// State for attendance upload
	const [attendanceForm, setAttendanceForm] = useState({
		studentId: '',
		studentName: '',
		studentClass: '',
		term: '',
		attendancePercent: 90,
	});

	const handleAttendanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setAttendanceForm({ ...attendanceForm, [name]: value });
	};
	const handleAttendanceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setAttendanceForm({ ...attendanceForm, [name]: value });
	};
	const handleAttendancePercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAttendanceForm({ ...attendanceForm, attendancePercent: Number(e.target.value) });
	};
	const handleAttendanceUpload = (e: React.FormEvent) => {
		e.preventDefault();
		if (!attendanceForm.studentId || !attendanceForm.studentName || !attendanceForm.studentClass || !attendanceForm.term) {
			alert('Please fill all required fields.');
			return;
		}
		addAttendance({
			studentId: attendanceForm.studentId,
			studentName: attendanceForm.studentName,
			studentClass: attendanceForm.studentClass,
			term: attendanceForm.term,
			attendancePercent: attendanceForm.attendancePercent,
		});
		setAttendanceForm({ studentId: '', studentName: '', studentClass: '', term: '', attendancePercent: 90 });
		alert('Attendance uploaded! It will appear in the Parent Dashboard.');
	};

	return (
		<>
			<Container fluid className="my-4" >
				<Row className="teacher-dashboard-row g-0">
					<Col md={3} className="p-0">
						<div className="teacher-sidebar bg-light border-end" style={{ minHeight: '100vh', position: 'fixed', width: '250px' }}>
							<div className="p-3 border-bottom">
								<h5 className="mb-0 text-primary">Teacher Panel</h5>
							</div>
							<ListGroup variant="flush" className="teacher-nav">
								<ListGroup.Item 
									action 
									active={activeKey === 'dashboard'} 
									onClick={() => setActiveKey('dashboard')}
									className="border-0 py-3"
								>
									<i className="bi bi-house-door me-3"></i> 
									<span>Dashboard</span>
								</ListGroup.Item>
								<ListGroup.Item 
									action 
									active={activeKey === 'results'} 
									onClick={() => setActiveKey('results')}
									className="border-0 py-3"
								>
									<i className="bi bi-clipboard-data me-3"></i> 
									<span>Upload Results</span>
								</ListGroup.Item>
								<ListGroup.Item 
									action 
									active={activeKey === 'events'} 
									onClick={() => setActiveKey('events')}
									className="border-0 py-3"
								>
									<i className="bi bi-calendar-plus me-3"></i> 
									<span>Add Events</span>
								</ListGroup.Item>
								<ListGroup.Item 
									action 
									active={activeKey === 'attendance'} 
									onClick={() => setActiveKey('attendance')}
									className="border-0 py-3"
								>
									<i className="bi bi-person-check me-3"></i> 
									<span>Attendance</span>
								</ListGroup.Item>
							</ListGroup>
						</div>
					</Col>
					<Col md={9} className="p-4 teacher-dashboard-section" style={{ marginLeft: '250px' }}>
						<div className="teacher-content">
							<Tab.Content>
								<Tab.Pane eventKey="dashboard" active={activeKey === 'dashboard'}>
									<div className="row dashboard-tab-section">
										<div className="col-md-12 mb-4">
											<Form.Group>
												<Form.Label>Choose Class to View Summary</Form.Label>
												<Form.Select value={selectedSummaryClass} onChange={e => setSelectedSummaryClass(e.target.value)} style={{ maxWidth: 300 }}>
													<option value="">Select class...</option>
													<option value="1 ">Class 1 </option>
													<option value="2 ">Class 2 </option>
													<option value="3 ">Class 3 </option>
													
												</Form.Select>
											</Form.Group>
										</div>
										{selectedSummaryClass && (
											<>
												<div className="col-md-6">
													<h3>Results Summary - {selectedSummaryClass}</h3>
													<table className="table table-bordered">
														<thead>
															<tr>
																<th>Student ID</th>
																<th>Student Name</th>
																<th>Latest Results</th>
															</tr>
														</thead>
														<tbody>
															{/* Example row, replace with real data */}
															<tr>
																<td>12A</td>
																<td>Jane Doe</td>
																<td>A</td>
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
													<h3>Attendance Summary - {selectedSummaryClass}</h3>
													<table className="table table-bordered">
														<thead>
															<tr>
																<th>Student ID</th>
																<th>Student Name</th>
																<th>Attendance (%)</th>
															</tr>
														</thead>
														<tbody>
															{/* Example row, replace with real data */}
															<tr>
																<td>12A</td>
																<td>Jane Doe</td>
																<td>98%</td>
															</tr>
														</tbody>
													</table>
												</div>
											</>
										)}
									</div>
								</Tab.Pane>
												<Tab.Pane eventKey="results" active={activeKey === 'results'}>
													<h3>Upload Results</h3>
													<Form onSubmit={handleResultsUpload}>
														<Form.Group className="mb-3">
															<Form.Label>Student Name</Form.Label>
															<Form.Control type="text" placeholder="Enter student name" name="studentName" value={resultsForm.studentName} onChange={handleResultsInputChange} required />
														</Form.Group>
														<Form.Group className="mb-3">
															<Form.Label>Student ID</Form.Label>
															<Form.Control type="text" placeholder="Enter student ID" name="studentId" value={resultsForm.studentId} onChange={handleResultsInputChange} required />
														</Form.Group>
														<Form.Group className="mb-3">
															<Form.Label>Class/Stream</Form.Label>
															<Form.Select name="studentClass" value={resultsForm.studentClass} onChange={handleResultsSelectChange} required>
																<option value="">Select class...</option>
																<option value="1 ">Class 1 </option>
																<option value="2 ">Class 2 </option>
																<option value="3 ">Class 3 </option>
															</Form.Select>
														</Form.Group>
														<Form.Group className="mb-3">
															<Form.Label>Term</Form.Label>
															<Form.Select name="term" value={resultsForm.term} onChange={handleResultsSelectChange} required>
																<option value="">Select term...</option>
																<option value="term1-midterm">Term 1 Midterm</option>
																<option value="term1-endterm">Term 1 End Term</option>
																<option value="term2-midterm">Term 2 Midterm</option>
																<option value="term2-endterm">Term 2 End Term</option>
																<option value="term3-midterm">Term 3 Midterm</option>
																<option value="term3-endterm">Term 3 End Term</option>
															</Form.Select>
														</Form.Group>
														<Form.Group className="mb-3">
															<Form.Label>Student Results (Excel or PDF)</Form.Label>
															<Form.Control type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf" onChange={handleResultsFileChange} required />
														</Form.Group>
														<Button variant="primary" type="submit">Upload Results</Button>
													</Form>
												</Tab.Pane>
																<Tab.Pane eventKey="events" active={activeKey === 'events'}>
																	<h3>Add School Event</h3>
																	<Form onSubmit={handleAddEvent}>
																		<Form.Group className="mb-3">
																			<Form.Label>Event Name</Form.Label>
																			<Form.Control
																				type="text"
																				placeholder="Enter event name"
																				name="title"
																				value={eventForm.title}
																				onChange={handleEventFormChange}
																				required
																			/>
																		</Form.Group>
																		<Form.Group className="mb-3">
																			<Form.Label>Date</Form.Label>
																			<Form.Control
																				type="date"
																				name="date"
																				value={eventForm.date}
																				onChange={handleEventFormChange}
																				required
																			/>
																		</Form.Group>
																		<Form.Group className="mb-3">
																			<Form.Label>Time</Form.Label>
																			<Form.Control
																				type="time"
																				name="time"
																				value={eventForm.time}
																				onChange={handleEventFormChange}
																				required
																			/>
																		</Form.Group>
																		<Form.Group className="mb-3">
																			<Form.Label>Description</Form.Label>
																			<Form.Control
																				as="textarea"
																				rows={2}
																				placeholder="Enter event description"
																				name="description"
																				value={eventForm.description}
																				onChange={handleEventFormChange}
																			/>
																		</Form.Group>
																		
																		<Button variant="primary" type="submit">Add Event</Button>
																	</Form>
																</Tab.Pane>
								<Tab.Pane eventKey="attendance" active={activeKey === 'attendance'}>
									<h3>Attendance</h3>
									<Form onSubmit={handleAttendanceUpload}>
										<Form.Group className="mb-3">
											<Form.Label>Student ID</Form.Label>
											<Form.Control type="text" placeholder="Enter student ID (e.g., 12A, 7B)" name="studentId" value={attendanceForm.studentId} onChange={handleAttendanceInputChange} required />
										</Form.Group>
										<Form.Group className="mb-3">
											<Form.Label>Student Name</Form.Label>
											<Form.Control type="text" placeholder="Enter student name" name="studentName" value={attendanceForm.studentName} onChange={handleAttendanceInputChange} required />
										</Form.Group>
										<Form.Group className="mb-3">
											<Form.Label>Student Class</Form.Label>
											<Form.Select name="studentClass" value={attendanceForm.studentClass} onChange={handleAttendanceSelectChange} required>
												<option value="">Select class...</option>
												<option value="1 ">Class 1 </option>
												<option value="2 ">Class 2 </option>
												<option value="3 ">Class 3 </option>
											</Form.Select>
										<Form.Group className="mb-3">
											<Form.Label>Term</Form.Label>
											<Form.Select name="term" value={attendanceForm.term} onChange={handleAttendanceSelectChange} required>
												<option value="">Select term...</option>
												<option value="term1-midterm">Term 1 Midterm</option>
												<option value="term1-endterm">Term 1 End Term</option>
												<option value="term2-midterm">Term 2 Midterm</option>
												<option value="term2-endterm">Term 2 End Term</option>
												<option value="term3-midterm">Term 3 Midterm</option>
												<option value="term3-endterm">Term 3 End Term</option>
											</Form.Select>
										</Form.Group>
										</Form.Group>
										<Form.Group className="mb-3">
											<Form.Label>Parent Email</Form.Label>
											<Form.Control type="email" placeholder="Enter parent email" />
										</Form.Group>
										<Form.Group className="mb-3">
											<Form.Label>Attendance (%)</Form.Label>
											<Form.Control type="number" min={0} max={100} name="attendancePercent" value={attendanceForm.attendancePercent} onChange={handleAttendancePercentChange} required />
										</Form.Group>
										<Button variant="primary" type="submit">Upload Attendance</Button>
									</Form>
								</Tab.Pane>
							</Tab.Content>
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default TeacherDashboard;
