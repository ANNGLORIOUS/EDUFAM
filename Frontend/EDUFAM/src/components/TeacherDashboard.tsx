import React, { useState } from 'react';
import feedbackData from '../data/seed_data.json';
import { useEvents } from '../context/useEvents';
import { useResults } from '../context/ResultsContextHook';
import { useAttendance } from '../context/AttendanceContextHook';
import { Container, Row, Col, Button, Form, ListGroup, Tab } from 'react-bootstrap';


 
const TeacherDashboard: React.FC = () => {
	const [activeKey, setActiveKey] = useState('dashboard');
	const [selectedSummaryClass, setSelectedSummaryClass] = useState("");
	const [summaryType, setSummaryType] = useState<'results' | 'events' | 'attendance'>('results');
	const { addEvent, events } = useEvents();
	const { addResult, results } = useResults();
	const { addAttendance, attendance } = useAttendance();

	// State for event form
		const [eventForm, setEventForm] = useState({
			title: '',
			date: '',
			startTime: '',
			endTime: '',
			description: '',
		});

	// State for results form
		   const [resultsForm, setResultsForm] = useState({
			   studentName: '',
			   studentId: '',
			   studentClass: '',
			   term: '',
			   grade: '',
			   parentEmail: '',
			   file: null as File | null,
		   });
	const handleResultsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setResultsForm({ ...resultsForm, file: e.target.files[0] });
		}
	};

	// State for attendance form
		   const [attendanceForm, setAttendanceForm] = useState({
			   studentId: '',
			   studentName: '',
			   studentClass: '',
			   term: '',
			   parentEmail: '',
			   weeks: Array(9).fill(false) as boolean[],
		   });

		   const handleAttendanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			   const { name, value } = e.target;
			   setAttendanceForm({ ...attendanceForm, [name]: value });
		   };

		const handleWeekCheckboxChange = (weekIdx: number) => {
			setAttendanceForm(prev => {
				const newWeeks = [...prev.weeks];
				newWeeks[weekIdx] = !newWeeks[weekIdx];
				return { ...prev, weeks: newWeeks };
			});
		};

	const handleAttendanceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setAttendanceForm({ ...attendanceForm, [name]: value });
	};


		   const handleAttendanceUpload = (e: React.FormEvent) => {
			   e.preventDefault();
			   if (!attendanceForm.studentId || !attendanceForm.studentName || !attendanceForm.studentClass || !attendanceForm.term || !attendanceForm.parentEmail) {
				   alert('Please fill in all required fields.');
				   return;
			   }
			   const weeksPresent = attendanceForm.weeks.filter(Boolean).length;
			   const attendancePercent = Math.round((weeksPresent / 9) * 100);
			   addAttendance({
				   studentId: attendanceForm.studentId,
				   studentName: attendanceForm.studentName,
				   studentClass: attendanceForm.studentClass,
				   term: attendanceForm.term,
				   parentEmail: attendanceForm.parentEmail,
				   attendancePercent
			   });
			   setAttendanceForm({ studentId: '', studentName: '', studentClass: '', term: '', parentEmail: '', weeks: Array(9).fill(false) });
			   alert('Attendance uploaded!');
		   };

	const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setEventForm({ ...eventForm, [name]: value });
	};

		const handleAddEvent = (e: React.FormEvent) => {
			e.preventDefault();
			if (!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.endTime) return;
			const [startHour, startMinute] = eventForm.startTime.split(':').map(Number);
			const [endHour, endMinute] = eventForm.endTime.split(':').map(Number);
			const start = new Date(eventForm.date);
			start.setHours(startHour, startMinute, 0, 0);
			const end = new Date(eventForm.date);
			end.setHours(endHour, endMinute, 0, 0);
			addEvent({
				title: eventForm.title,
				start,
				end,
				description: eventForm.description,
			});
			setEventForm({ title: '', date: '', startTime: '', endTime: '', description: '' });
			alert('Event added! It will appear in the Parent Dashboard.');
		};

	   const handleResultsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		   const { name, value } = e.target;
		   setResultsForm({ ...resultsForm, [name]: value });
	   };

	const handleResultsSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setResultsForm({ ...resultsForm, [name]: value });
	};



		   const handleResultsUpload = async (e: React.FormEvent) => {
			   e.preventDefault();
			   if (!resultsForm.studentName || !resultsForm.studentId || !resultsForm.studentClass || !resultsForm.term || !resultsForm.grade || !resultsForm.parentEmail) {
				   alert('Please fill in all required fields.');
				   return;
			   }
			   let fileName: string | undefined = undefined;
			   let fileDataUrl: string | undefined = undefined;
			   if (resultsForm.file) {
				   fileName = resultsForm.file.name;
				   fileDataUrl = await new Promise<string>((resolve, reject) => {
					   const reader = new FileReader();
					   reader.onload = () => resolve(reader.result as string);
					   reader.onerror = reject;
					   reader.readAsDataURL(resultsForm.file!);
				   });
			   }
			   addResult({
				   studentName: resultsForm.studentName,
				   studentId: resultsForm.studentId,
				   studentClass: resultsForm.studentClass,
				   term: resultsForm.term,
				   grade: resultsForm.grade,
				   parentEmail: resultsForm.parentEmail,
				   ...(fileName && fileDataUrl ? { fileName, fileDataUrl } : {})
			   });
			   setResultsForm({ studentName: '', studentId: '', studentClass: '', term: '', grade: '', parentEmail: '', file: null });
			   alert('Results uploaded!');
		   };

	return (
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
						   <ListGroup.Item action active={activeKey === 'feedback'} onClick={() => setActiveKey('feedback')}>
							   <i className="bi bi-chat-dots me-2"></i> Feedback
						   </ListGroup.Item>
					   </ListGroup>
				   </Col>
				   <Col md={9} className="p-4 teacher-dashboard-section">
					   <div style={{ marginTop: '40px' }}>
						   <Tab.Content>
							{activeKey === 'dashboard' && (
								<Tab.Pane eventKey="dashboard" active>
									<div className="row dashboard-tab-section">
										<div className="col-md-12 mb-4 d-flex align-items-end gap-3">
											<Form.Group style={{ marginBottom: 0 }}>
												<Form.Label>Choose Class to View Summary</Form.Label>
												<Form.Select value={selectedSummaryClass} onChange={e => setSelectedSummaryClass(e.target.value)} style={{ maxWidth: 200, display: 'inline-block', marginRight: 16 }}>
													<option value="">Select class...</option>
													<option value="1 ">Class 1 </option>
													<option value="2 ">Class 2 </option>
													<option value="3 ">Class 3 </option>
												</Form.Select>
											</Form.Group>
											{selectedSummaryClass && (
												<Form.Group style={{ marginBottom: 0 }}>
													<Form.Label>Summary Type</Form.Label>
													<Form.Select value={summaryType} onChange={e => setSummaryType(e.target.value as 'results' | 'events' | 'attendance')} style={{ maxWidth: 180, display: 'inline-block' }}>
														<option value="results">Result Summary</option>
														<option value="events">Event Summary</option>
														<option value="attendance">Attendance Summary</option>
													</Form.Select>
												</Form.Group>
											)}
										</div>
										{selectedSummaryClass && (
											<div className="row">
												{summaryType === "results" && (
													<div className="col-md-6">
														<h3>Results Summary - {selectedSummaryClass}</h3>
														<table className="table table-bordered">
															<thead>
																<tr>
																	<th>Student ID</th>
																	<th>Student Name</th>
																	<th>Grade</th>
																	<th>Term</th>
																	<th>File</th>
																</tr>
															</thead>
															<tbody>
																{results.filter(r => r.studentClass === selectedSummaryClass).length === 0 ? (
																	<tr><td colSpan={5} className="text-center">No results uploaded</td></tr>
																) : (
																	results.filter(r => r.studentClass === selectedSummaryClass).map((r, idx) => (
																		<tr key={idx}>
																			<td>{r.studentId}</td>
																			<td>{r.studentName}</td>
																			<td>{r.grade}</td>
																			<td>{r.term}</td>
																			<td>{r.fileName ? <a href={r.fileDataUrl} target="_blank" rel="noopener noreferrer">{r.fileName}</a> : '—'}</td>
																		</tr>
																	))
																)}
															</tbody>
														</table>
													</div>
												)}
												{summaryType === "events" && (
													<div className="col-md-6">
														<h3>Events Summary - {selectedSummaryClass}</h3>
														<table className="table table-bordered">
															<thead>
																<tr>
																	<th>Event Name</th>
																	<th>Date</th>
																	<th>Start Time</th>
																	<th>End Time</th>
																	<th>Description</th>
																</tr>
															</thead>
															<tbody>
																   {events.length === 0 ? (
																	   <tr><td colSpan={5} className="text-center">No events uploaded</td></tr>
																   ) : (
																	   events.map((ev, idx) => (
																		   <tr key={idx}>
																			   <td>{ev.title}</td>
																			   <td>{ev.start ? new Date(ev.start).toLocaleDateString() : ''}</td>
																			   <td>{ev.start ? new Date(ev.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
																			   <td>{ev.end ? new Date(ev.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</td>
																			   <td>{ev.description}</td>
																		   </tr>
																	   ))
																   )}
															</tbody>
														</table>
													</div>
												)}
												{summaryType === "attendance" && (
													<div className="col-md-6">
														<h3>Attendance Summary - {selectedSummaryClass}</h3>
														<table className="table table-bordered">
															<thead>
																<tr>
																	<th>Student ID</th>
																	<th>Student Name</th>
																	<th>Term</th>
																	<th>Attendance (%)</th>
																</tr>
															</thead>
															<tbody>
																{attendance.filter(a => a.studentClass === selectedSummaryClass).length === 0 ? (
																	<tr><td colSpan={4} className="text-center">No attendance uploaded</td></tr>
																) : (
																	attendance.filter(a => a.studentClass === selectedSummaryClass).map((a, idx) => (
																		<tr key={idx}>
																			<td>{a.studentId}</td>
																			<td>{a.studentName}</td>
																			<td>{a.term}</td>
																			<td>{a.attendancePercent}%</td>
																		</tr>
																	))
																)}
															</tbody>
														</table>
													</div>
												)}
											</div>
										)}
									</div>
								</Tab.Pane>
							)}
																			{activeKey === 'results' && (
																				<Tab.Pane eventKey="results" active>
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
																													<option value="term1">Term 1</option>
																													<option value="term2">Term 2</option>
																													<option value="term3">Term 3</option>
																												</Form.Select>
																											</Form.Group>
																						   <Form.Group className="mb-3">
																							   <Form.Label>Grade</Form.Label>
																							   <Form.Select name="grade" value={resultsForm.grade} onChange={handleResultsSelectChange} required>
																								   <option value="">Select grade...</option>
																								   <option value="A">A</option>
																								   <option value="B+">B+</option>
																								   <option value="B">B</option>
																								   <option value="B-">B-</option>
																								   <option value="C+">C+</option>
																								   <option value="C">C</option>
																								   <option value="C-">C-</option>
																								   <option value="D+">D+</option>
																								   <option value="D">D</option>
																								   <option value="D-">D-</option>
																							   </Form.Select>
																						   </Form.Group>
																						   <Form.Group className="mb-3">
																							   <Form.Label>Parent Email</Form.Label>
																							   <Form.Control type="email" placeholder="Enter parent email" name="parentEmail" value={resultsForm.parentEmail} onChange={handleResultsInputChange} required />
																						   </Form.Group>
																						<Form.Group className="mb-3">
																							<Form.Label>Student Results (Excel or PDF)</Form.Label>
																							<Form.Control type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/pdf,.pdf" onChange={handleResultsFileChange} required />
																						</Form.Group>
																						<Button variant="primary" type="submit">Upload Results</Button>
																					</Form>
																				</Tab.Pane>
															)}
																							{activeKey === 'attendance' && (
																								<Tab.Pane eventKey="attendance" active>
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
																										</Form.Group>
																															<Form.Group className="mb-3">
																																<Form.Label>Term</Form.Label>
																																<Form.Select name="term" value={attendanceForm.term} onChange={handleAttendanceSelectChange} required>
																																	<option value="">Select term...</option>
																																	<option value="term1">Term 1</option>
																																	<option value="term2">Term 2</option>
																																	<option value="term3">Term 3</option>
																																</Form.Select>
																															</Form.Group>
																															<Form.Group className="mb-3">
																																<Form.Label>Parent Email</Form.Label>
																																<Form.Control type="email" placeholder="Enter parent email" name="parentEmail" value={attendanceForm.parentEmail} onChange={handleAttendanceInputChange} required />
																															</Form.Group>
																										<Form.Group className="mb-3">
																											<Form.Label>Mark Attendance for Weeks 1-9</Form.Label>
																											<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
																												{attendanceForm.weeks.map((present, idx) => (
																													<Form.Check
																														key={idx}
																														type="checkbox"
																														label={`Week ${idx + 1}`}
																														checked={present}
																														onChange={() => handleWeekCheckboxChange(idx)}
																													/>
																												))}
																											</div>
																										</Form.Group>
																										<Button variant="primary" type="submit">Upload Attendance</Button>
																									</Form>
																								</Tab.Pane>
																			)}
																							{activeKey === 'events' && (
																								<Tab.Pane eventKey="events" active>
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
																											<Form.Label>Start Time</Form.Label>
																											<Form.Control
																												type="time"
																												name="startTime"
																												value={eventForm.startTime}
																												onChange={handleEventFormChange}
																												required
																											/>
																										</Form.Group>
																										<Form.Group className="mb-3">
																											<Form.Label>End Time</Form.Label>
																											<Form.Control
																												type="time"
																												name="endTime"
																												value={eventForm.endTime}
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
											)}
											{activeKey === 'feedback' && (
  <Tab.Pane eventKey="feedback" active>
    <h3>Parent Feedback</h3>
		<div className="mt-4">
			<ul className="list-group">
						{/* Display feedback from seed_data.json */}
						{(feedbackData.feedback as Array<{ parentEmail: string; concern: string; message: string }> ).map((fb, idx) => (
							<li className="list-group-item" key={idx}>
								<strong>Parent Email:</strong> {fb.parentEmail}<br/>
								<strong>Concern Type:</strong> {fb.concern}<br/>
								<strong>Message:</strong> {fb.message}
							</li>
						))}
			</ul>
		</div>
  </Tab.Pane>
)}
						</Tab.Content>
					</div>
				</Col>
			</Row>
		</Container>
	);
};

export default TeacherDashboard;
