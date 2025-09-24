import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useEvents } from '../../context/useEvents';

const EventsView: React.FC = () => {
	const { addEvent } = useEvents();

	// State for event form
	const [eventForm, setEventForm] = useState({
		title: '',
		date: '',
		startTime: '',
		endTime: '',
		description: '',
	});

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

	return (
		<>
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
		</>
	);
};

export default EventsView;
