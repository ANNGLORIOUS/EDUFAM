import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Routes, Route } from 'react-router-dom';
import TeacherSidebar from './TeacherSidebar';
import { TeacherView, ResultsView, EventsView, AttendanceView, FeedbackView } from '.';
import CustomNavbar from '../Navbar';
import { useEvents } from '../../context/useEvents';

const TeacherDashboard: React.FC = () => {
	const [sidebarOpen, setSidebarOpen] = useState(true);
	
	// Use events from context for notifications
	const { events } = useEvents();
	const now = new Date();
	
	// Transform events into notifications for the bell icon
	type Notification = {
		id: number;
		message: string;
		date: string;
		event: string;
		description: string;
		extra: string;
		start: string;
		end: string;
	};
	
	const notifications: Notification[] = events
		.filter((e) => e.start > now)
		.sort((a, b) => a.start.getTime() - b.start.getTime())
		.slice(0, 5)
		.map((e) => ({
			id: e.id,
			message: e.title,
			date: e.start.toLocaleDateString(),
			event: e.title,
			description: e.description,
			extra: '',
			start: e.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			end: e.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
		}));

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	// Teacher navigation items

		// Add state for selected class and summary type
		const [selectedClass, setSelectedClass] = useState("");
		const [summaryType, setSummaryType] = useState<'results' | 'events' | 'attendance'>('results');

		// Teacher navigation items with Dashboard as dropdown
		const teacherNavItems = [
			{
				path: '/teacher',
				label: 'Dashboard',
				icon: 'bi bi-speedometer2',
				dropdown: true,
				dropdownOptions: [
					{ value: '1', label: 'Class 1' },
					{ value: '2', label: 'Class 2' },
					{ value: '3', label: 'Class 3' },
				],
			},
			{ path: '/teacher/results', label: 'Upload Results', icon: 'bi bi-file-earmark-text' },
			{ path: '/teacher/events', label: 'Add Events', icon: 'bi bi-calendar-event' },
			{ path: '/teacher/attendance', label: 'Upload Attendance', icon: 'bi bi-person-check' },
			{ path: '/teacher/feedback', label: 'Parent Feedback', icon: 'bi bi-chat-dots' }
		];

	return (
		<>
			{/* Add Navbar with notifications for teacher */}
			<CustomNavbar notifications={notifications} toggleSidebar={toggleSidebar} />

			<div className="teacher-dashboard">
				{/* Sidebar with class dropdown (teacher only) */}
				<TeacherSidebar
					navItems={teacherNavItems}
					isOpen={sidebarOpen}
					onClassSelect={setSelectedClass}
					selectedClass={selectedClass}
				/>

				{/* Main Content */}
				<div
					className={`teacher-content ${sidebarOpen ? 'sidebar-open' : ''}`}
					style={{
						marginLeft: sidebarOpen ? '200px' : '0',
						transition: 'margin-left 0.3s ease-in-out',
						padding: '20px',
						paddingTop: '100px'
					}}
				>
					<Container fluid>
						<Routes>
							<Route path="/" element={
								<>
									<div className="mb-4" style={{ maxWidth: 300 }}>
										<label style={{ fontWeight: 500 }}>Summary Type</label>
										<select
											className="form-select"
											value={summaryType}
											onChange={e => setSummaryType(e.target.value as 'results' | 'events' | 'attendance')}
										>
											<option value="results">Result Summary</option>
											<option value="events">Event Summary</option>
											<option value="attendance">Attendance Summary</option>
										</select>
									</div>
									<TeacherView selectedClass={selectedClass} summaryType={summaryType} />
								</>
							} />
							<Route path="/results" element={<ResultsView />} />
							<Route path="/events" element={<EventsView />} />
							<Route path="/attendance" element={<AttendanceView />} />
							<Route path="/feedback" element={<FeedbackView />} />
						</Routes>
					</Container>
				</div>

				{/* Backdrop for mobile */}
				{sidebarOpen && (
					<div
						className="sidebar-backdrop"
						onClick={toggleSidebar}
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							backgroundColor: 'rgba(0, 0, 0, 0.5)',
							zIndex: 1019,
							display: window.innerWidth <= 768 ? 'block' : 'none'
						}}
					/>
				)}
			</div>
		</>
	);
};

export default TeacherDashboard;
