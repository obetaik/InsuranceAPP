import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user just registered
  useEffect(() => {
    const state = location.state;
    if (state && state.from === 'register') {
      setSuccessMessage('Account created successfully! Please sign in with Auth0 to continue.');
      // Clear the state after showing message
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  console.log('🔐 Login page rendered');
  console.log('isLoading:', isLoading);
  console.log('error:', error);
  console.log('isAuthenticated:', isAuthenticated);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('✅ User already authenticated, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogin = () => {
    console.log('🚀 Login button clicked, initiating Auth0 login...');
    login();
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Checking authentication...</p>
        </div>
      </Container>
    );
  }

  // If authenticated, don't show login form (redirect will happen via useEffect)
  if (isAuthenticated) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Already logged in, redirecting...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0 rounded-3">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h1 className="display-5 fw-bold text-primary">Insurance App</h1>
                <p className="text-muted mt-2">
                  Secure your future with the right coverage
                </p>
              </div>
              
              {successMessage && (
                <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccessMessage('')}>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {successMessage}
                  </div>
                </Alert>
              )}
              
              {error && (
                <Alert variant="danger" className="mb-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error.message}
                  </div>
                </Alert>
              )}
              
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleLogin}
                disabled={isLoading}
                className="w-100 mb-4 py-3 rounded-pill"
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Sign In with Auth0
                  </>
                )}
              </Button>
              
              <div className="position-relative my-4">
                <hr />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                  New here?
                </span>
              </div>
              
              <Button 
                as={Link}
                to="/register"
                variant="outline-primary" 
                size="lg"
                className="w-100 py-3 rounded-pill"
              >
                <i className="bi bi-person-plus-fill me-2"></i>
                Create New Account
              </Button>
              
              <div className="mt-4 text-center">
                <small className="text-muted">
                  By signing up, you agree to our 
                  <Link to="/terms" className="text-decoration-none"> Terms of Service</Link> and 
                  <Link to="/privacy" className="text-decoration-none"> Privacy Policy</Link>
                </small>
              </div>
            </Card.Body>
          </Card>
          
          {/* Feature Highlights */}
          <Row className="mt-5">
            <Col md={4} className="text-center mb-3">
              <i className="bi bi-shield-check fs-1 text-primary"></i>
              <h6 className="mt-2">Secure & Trusted</h6>
            </Col>
            <Col md={4} className="text-center mb-3">
              <i className="bi bi-clock-history fs-1 text-primary"></i>
              <h6 className="mt-2">24/7 Support</h6>
            </Col>
            <Col md={4} className="text-center mb-3">
              <i className="bi bi-graph-up fs-1 text-primary"></i>
              <h6 className="mt-2">Easy Claims Process</h6>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;