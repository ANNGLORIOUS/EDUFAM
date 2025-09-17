import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';

const TeacherView: React.FC = () => {
	const [selectedSummaryClass, setSelectedSummaryClass] = useState("");

	return (
		<>
			<Row className="teacher-dashboard-row g-0">
				<Col md={12} className="p-4 teacher-dashboard-section">
					<div style={{ marginTop: '40px' }}>
						<div className="row dashboard-tab-section">
							<div className="col-md-12 mb-4">
								<Form.Group>
									<Form.Label>Choose Class to View Summary</Form.Label>
									<Form.Select value={selectedSummaryClass} onChange={e => setSelectedSummaryClass(e.target.value)} style={{ maxWidth: 300 }}>
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
					</div>
				</Col>
			</Row>
		</>
	);
};

export default TeacherView;
