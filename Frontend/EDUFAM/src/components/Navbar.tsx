import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import NotificationsPopup from './NotificationsPopup';
import type { NotificationItem } from './NotificationsPopup';

interface CustomNavbarProps {
  notifications?: NotificationItem[];
}

const CustomNavbar: React.FC<CustomNavbarProps> = ({ notifications }) => {
  return (
    <Navbar className="bg-edufam-dark" variant="dark" expand="lg" fixed="top">
      <Container>
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
              <NotificationsPopup notifications={notifications} />
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