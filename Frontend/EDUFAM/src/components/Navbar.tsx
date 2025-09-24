import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import NotificationsPopup from './NotificationsPopup';
import type { NotificationItem } from '../context/NotificationsContext';
import { useCurrentUser } from '../context/useCurrentUser';

interface CustomNavbarProps {
  notifications?: NotificationItem[];
  toggleSidebar?: () => void;
}

const CustomNavbar: React.FC<CustomNavbarProps> = ({ notifications, toggleSidebar }) => {
  const currentUser = useCurrentUser();

  // Debug: Log current user information
  console.log('Navbar - Current user:', currentUser);
  console.log('Navbar - Notifications prop:', notifications);

  return (
    <Navbar className="bg-edufam-dark" variant="dark" expand="lg" fixed="top">
      <Container>
        {/* Hamburger Menu Button */}
        {toggleSidebar && (
          <Button
            variant="outline-light"
            className="me-3 d-flex align-items-center"
            onClick={toggleSidebar}
            style={{ border: 'none', padding: '0.375rem 0.75rem' }}
          >
            <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
          </Button>
        )}
        <Navbar.Brand href="#home" >
          {/* Logo Text */}
          <span className="ml-2 text-xl font-bold">EDUFAM</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
          </Nav>
          <Nav>
            {/* Show notifications bell only if notifications prop is provided */}
            {notifications && (
              <NotificationsPopup 
                notifications={notifications} 
                userType={currentUser?.type || 'parent'}
                userEmail={currentUser?.email || 'default@example.com'}
              />
            )}
            {/* User Account */}
            <SignedOut>
              <SignInButton>
                <Button className="sign-in-btn rounded-pill d-flex align-items-center px-3 py-2">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/welcome" />
            </SignedIn>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;