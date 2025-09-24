


import type { Feedback } from '../../context/FeedbackContextObject';

const FeedbackView: React.FC = () => {
	// Always read from localStorage for real-time sync
	let feedbacks: Feedback[] = [];
	try {
		const local = localStorage.getItem('edufam_feedbacks');
		if (local) {
			const parsed = JSON.parse(local);
			if (Array.isArray(parsed)) feedbacks = parsed;
		}
		} catch {
			// Ignore JSON parse errors
		}

	return (
		<div className="container-fluid px-0">
			<h3 className="mb-4" style={{ color: '#0a58ca', fontWeight: 700, letterSpacing: 0.5 }}>Parent Feedback</h3>
			<div className="row g-4">
				{feedbacks.length === 0 ? (
					<div className="alert alert-info col-12">
						No feedback received yet.
					</div>
				) : (
					feedbacks.map((fb: Feedback, idx: number) => (
						<div className="col-md-6 col-lg-4 d-flex" key={idx}>
							<div className="card shadow-sm border-0 flex-fill" style={{ borderRadius: 18, background: ' #d6c8d4ff ', minWidth: 0 }}>
								<div className="card-body d-flex flex-column justify-content-between h-100">
									<div>
										<div className="d-flex align-items-center mb-2">
											<i className="bi bi-person-circle me-2" style={{ fontSize: 24, color: '#4b2994' }}></i>
											<span className="fw-bold text-break" style={{ color: '#4b2994', wordBreak: 'break-all' }}>{fb.parentEmail}</span>
										</div>
										<div className="mb-2">
											<span className="badge bg-primary me-2" style={{ background: '#4b2994', fontWeight: 500 }}>{fb.concernType.toUpperCase()}</span>
										</div>
										<div className="mb-3" style={{ color: '#333', fontWeight: 500 }}>
											<i className="bi bi-chat-left-text me-2" style={{ color: '#a83279' }}></i>
											{fb.message}
										</div>
									</div>
									<div>
										{fb.requestCallback && (
											<div className="mb-1">
												<i className="bi bi-telephone me-2" style={{ color: '#ff9800' }}></i>
												<span className="fw-semibold" style={{ color: '#ff9800' }}>Requests Callback</span>
											</div>
										)}
										{fb.scheduleMeeting && (
											<div>
												<i className="bi bi-calendar-event me-2" style={{ color: '#2196f3' }}></i>
												<span className="fw-semibold" style={{ color: '#2196f3' }}>Requests Meeting</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};




export default FeedbackView;
