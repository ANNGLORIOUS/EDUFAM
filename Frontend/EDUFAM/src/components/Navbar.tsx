import React from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const CustomNavbar: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  return (
    <Navbar className="bg-edufam-dark" variant="dark" fixed="top">
      <Container fluid>
        <Button onClick={toggleSidebar} className="bg-transparent border-0">
          <i className="bi bi-list fs-4"></i>
        </Button>
        <Navbar.Brand href="#home" >
          {/* Logo Text */}
          <span className="ml-2 text-xl font-bold">EDUFAM</span>
        </Navbar.Brand>
        {/* Removed Navbar.Toggle (hamburger) */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
          </Nav>
          <Nav>
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