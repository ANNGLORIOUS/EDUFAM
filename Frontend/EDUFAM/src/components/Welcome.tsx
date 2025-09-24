import React, { useEffect } from 'react';
import CustomNavbar from './Navbar';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';


const Welcome: React.FC = () => {
	const { isSignedIn, user } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		if (isSignedIn && user) {
			const teacherEmail = "sandranyambura72@gmail.com";
			if (user.primaryEmailAddress?.emailAddress === teacherEmail) {
				navigate('/teacher', { replace: true });
			} else {
				navigate('/parent', { replace: true });
			}
		}
	}, [isSignedIn, user, navigate]);

	return (
		<>
					<CustomNavbar />
					<section style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '60vh',
						background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)',
						padding: '4rem 1rem 2rem 1rem',
						textAlign: 'center',
						borderRadius: '0 0 32px 32px',
						boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
					}}>
						<h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e0a3c', marginBottom: '1rem' }}>
							Welcome to EDUFAM
						</h1>
						<p style={{ fontSize: '1.25rem', color: '#333', maxWidth: 600, margin: '0 auto 2rem auto' }}>
							Bridging the communication gap between teachers and parents for student success. Stay connected, informed, and engaged with your school community—all in one place.
						</p>
						<a
							href="#learn-more"
							style={{
								display: 'inline-block',
								background: '#fb7100',
								color: '#fff',
								padding: '0.75rem 2rem',
								borderRadius: '25px',
								fontWeight: 600,
								fontSize: '1.1rem',
								textDecoration: 'none',
								boxShadow: '0 2px 8px rgba(251,113,0,0.12)',
								transition: 'background 0.2s',
							}}
						>
							Learn More
						</a>
					</section>
					<section id="learn-more" style={{
						maxWidth: 900,
						margin: '3rem auto 0 auto',
						padding: '2rem 1rem',
						background: '#fff',
						borderRadius: '20px',
						boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
						textAlign: 'center',
					}}>
						<h2 style={{ color: '#1e0a3c', fontWeight: 600, marginBottom: '2.5rem' }}>Why Choose EDUFAM?</h2>
								<div style={{
									display: 'flex',
									flexDirection: 'row',
									gap: '2rem',
									marginBottom: '2.5rem',
									overflowX: 'auto',
									justifyContent: 'center',
									alignItems: 'stretch',
									flexWrap: 'nowrap',
									paddingLeft: '2rem',
									paddingRight: '2rem',
								}}>
							<div style={{
								background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)',
								borderRadius: '16px',
								boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
								padding: '2rem 1.2rem',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								minHeight: '180px',
							}}>
								<span style={{ display: 'inline-block', marginBottom: '0.7rem' }}>
									{/* Chat/Message SVG */}
									<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
										<circle cx="20" cy="20" r="20" fill="url(#chat-gradient)"/>
										<path d="M13 18h14M13 22h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
										<defs>
											<linearGradient id="chat-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
												<stop stopColor="#fb7100"/>
												<stop offset="1" stopColor="#ffd600"/>
											</linearGradient>
										</defs>
									</svg>
								</span>
								<h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1e0a3c', marginBottom: '0.5rem' }}>All-in-One Communication</h3>
								<p style={{ color: '#333', fontSize: '1rem', margin: 0 }}>Messaging, announcements, and updates in one secure platform.</p>
							</div>
							<div style={{
								background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)',
								borderRadius: '16px',
								boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
								padding: '2rem 1.2rem',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								minHeight: '180px',
							}}>
								<span style={{ display: 'inline-block', marginBottom: '0.7rem' }}>
									{/* Bell/Notification SVG */}
									<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
										<circle cx="20" cy="20" r="20" fill="url(#bell-gradient)"/>
										<path d="M20 28a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-4V18a6 6 0 1 0-12 0v6l-2 2v1h16v-1l-2-2z" fill="#fff"/>
										<defs>
											<linearGradient id="bell-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
												<stop stopColor="#0d6efd"/>
												<stop offset="1" stopColor="#00e0ff"/>
											</linearGradient>
										</defs>
									</svg>
								</span>
								<h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1e0a3c', marginBottom: '0.5rem' }}>Stay Informed</h3>
								<p style={{ color: '#333', fontSize: '1rem', margin: 0 }}>Real-time notifications about your child’s progress, attendance, and school events.</p>
							</div>
							<div style={{
								background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)',
								borderRadius: '16px',
								boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
								padding: '2rem 1.2rem',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								minHeight: '180px',
							}}>
								<span style={{ display: 'inline-block', marginBottom: '0.7rem' }}>
									{/* Sparkle/Star SVG */}
									<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
										<circle cx="20" cy="20" r="20" fill="url(#star-gradient)"/>
										<path d="M20 12l2.09 6.26H28l-5.18 3.76L24.18 28 20 24.27 15.82 28l1.36-5.98L12 18.26h5.91z" fill="#fff"/>
										<defs>
											<linearGradient id="star-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
												<stop stopColor="#198754"/>
												<stop offset="1" stopColor="#a8ff78"/>
											</linearGradient>
										</defs>
									</svg>
								</span>
								<h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1e0a3c', marginBottom: '0.5rem' }}>Easy to Use</h3>
								<p style={{ color: '#333', fontSize: '1rem', margin: 0 }}>Intuitive design for parents and teachers of all tech levels.</p>
							</div>
							<div style={{
								background: 'linear-gradient(135deg, #f8fafc 0%, #e9ecef 100%)',
								borderRadius: '16px',
								boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
								padding: '2rem 1.2rem',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								minHeight: '180px',
							}}>
								<span style={{ display: 'inline-block', marginBottom: '0.7rem' }}>
									{/* Lock/Security SVG */}
									<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
										<circle cx="20" cy="20" r="20" fill="url(#lock-gradient)"/>
										<rect x="13" y="18" width="14" height="10" rx="2" fill="#fff"/>
										<rect x="17" y="14" width="6" height="6" rx="3" fill="#fff"/>
										<defs>
											<linearGradient id="lock-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
												<stop stopColor="#6f42c1"/>
												<stop offset="1" stopColor="#e0c3fc"/>
											</linearGradient>
										</defs>
									</svg>
								</span>
								<h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1e0a3c', marginBottom: '0.5rem' }}>Secure & Private</h3>
								<p style={{ color: '#333', fontSize: '1rem', margin: 0 }}>Your data is protected with industry-leading security.</p>
							</div>
						</div>
						<p style={{ marginTop: '2rem', color: '#666' }}>
							Ready to experience seamless school communication? <br />
							<a href="/sign-in" style={{ color: '#fb7100', fontWeight: 600, textDecoration: 'underline' }}>Sign in</a> or <a href="/sign-up" style={{ color: '#fb7100', fontWeight: 600, textDecoration: 'underline' }}>Create an account</a> today!
						</p>
					</section>
		</>
	);
};

export default Welcome;
