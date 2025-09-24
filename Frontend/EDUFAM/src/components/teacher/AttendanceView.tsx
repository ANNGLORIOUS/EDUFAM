import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useAttendance } from '../../context/AttendanceContextHook';

const AttendanceView: React.FC = () => {
	const { addAttendance } = useAttendance();

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

	const handleAttendanceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

	return (
		<>
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
		</>
	);
};

export default AttendanceView;
