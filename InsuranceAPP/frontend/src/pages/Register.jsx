import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors({});
    setSuccess('');

    try {
      console.log('📝 Registering user profile...');
      console.log('Form data:', formData);
      
      const response = await api.post('/register', formData);
      
      console.log('✅ Registration response:', response.data);
      
      if (response.data.success) {
        setSuccess('Profile created successfully! Redirecting to login...');
        
        setTimeout(() => {
          navigate('/login', { state: { from: 'register' } });
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        setErrors(validationErrors);
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join(', '));
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const showError = (fieldName) => {
    return errors[fieldName] && <Form.Text className="text-danger">{errors[fieldName][0]}</Form.Text>;
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={7} xl={6}>
          <Card className="shadow-lg border-0 rounded-3">
            <Card.Header className="bg-primary text-white text-center py-4 rounded-top-3">
              <h2 className="mb-0">Create Your Profile</h2>
              <p className="mb-0 mt-2 text-white-50">Join us and protect what matters most</p>
            </Card.Header>
            <Card.Body className="p-5">
              {error && (
                <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccess('')}>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {success}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    isInvalid={!!errors.name}
                    className="py-2"
                    required
                  />
                  {showError('name')}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    isInvalid={!!errors.email}
                    className="py-2"
                    required
                  />
                  {showError('email')}
                  <Form.Text className="text-muted">
                    This will be used for login and account recovery.
                  </Form.Text>
                </Form.Group>

                <hr className="my-4" />
                <h6 className="mb-3 fw-semibold text-muted">Optional Information</h6>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    isInvalid={!!errors.phone}
                    className="py-2"
                  />
                  {showError('phone')}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    isInvalid={!!errors.address}
                    className="py-2"
                  />
                  {showError('address')}
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        isInvalid={!!errors.city}
                        className="py-2"
                      />
                      {showError('city')}
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        isInvalid={!!errors.state}
                        className="py-2"
                      />
                      {showError('state')}
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Zip Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleInputChange}
                        placeholder="Zip Code"
                        isInvalid={!!errors.zip_code}
                        className="py-2"
                      />
                      {showError('zip_code')}
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    size="lg"
                    className="rounded-pill py-3"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus-fill me-2"></i>
                        Create Profile
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline-secondary" 
                    as={Link} 
                    to="/login"
                    size="lg"
                    className="rounded-pill py-3"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Sign In
                  </Button>
                </div>
              </Form>
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

export default Register;