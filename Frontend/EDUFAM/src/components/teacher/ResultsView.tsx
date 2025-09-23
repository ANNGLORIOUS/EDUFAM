import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useResults } from '../../context/ResultsContextHook';

const ResultsView: React.FC = () => {
	const { addResult } = useResults();

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
		<>
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
		</>
	);
};

export default ResultsView;
