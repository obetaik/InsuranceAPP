import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useTestAuth } from '../App';

function Navigation() {
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';
  
  let auth;
  if (skipAuth) {
    auth = useTestAuth();
  } else {
    auth = useAuth0();
  }

  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = auth;
  const navigate = useNavigate();

  const handleLogout = () => {
    if (skipAuth) {
      logout();
    } else {
      logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  const handleLogin = () => {
    if (skipAuth) {
      loginWithRedirect();
      navigate('/dashboard');
    } else {
      loginWithRedirect();
    }
  };

  if (isLoading) {
    return (
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">InsuranceApp</Navbar.Brand>
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <strong>InsuranceApp...</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/products">Products</Nav.Link>
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/quotes">Quotes</Nav.Link>
                <Nav.Link as={Link} to="/policies">Policies</Nav.Link>
                <Nav.Link as={Link} to="/claims">Claims</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/profile">
                  <span className="text-white">
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.name || user?.email || 'Profile'}
                  </span>
                </Nav.Link>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="outline-light" onClick={handleLogin}>
                Login / Sign Up
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;