import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Profile() {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📊 Fetching profile from Laravel backend...');
      
      const token = await getAccessTokenSilently();
      console.log('✅ Token obtained');
      
      const response = await api.get('/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Profile API response:', response.data);
      
      // Handle response - the data is in response.data.data
      if (response.data && response.data.success === true) {
        const userData = response.data.data;
        console.log('📧 User email from API:', userData.email);
        
        setProfile(userData);
        
        // Set form data
        setFormData({
          name: userData.name || '',
          email: userData.email || user?.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zip_code: userData.zip_code || '',
        });
      } else {
        console.error('❌ Invalid response structure:', response.data);
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('📊 Updating profile...');
      console.log('Form data being sent:', formData);
      
      const token = await getAccessTokenSilently();
      
      // Only send fields that have values (excluding email which is read-only)
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code
      };
      
      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          delete updateData[key];
        }
      });
      
      console.log('Sending update data:', updateData);
      
      const response = await api.put('/profile', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Profile update response:', response.data);
      
      // Check if update was successful
      // The API returns success: true in response.data
      if (response.data && response.data.success === true) {
        setSuccess(response.data.message || 'Profile updated successfully!');
        
        // Update local profile data with new values
        if (response.data.data) {
          setProfile(response.data.data);
          setFormData(prev => ({
            ...prev,
            name: response.data.data.name || prev.name,
            phone: response.data.data.phone || prev.phone,
            address: response.data.data.address || prev.address,
            city: response.data.data.city || prev.city,
            state: response.data.data.state || prev.state,
            zip_code: response.data.data.zip_code || prev.zip_code,
          }));
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        // If response doesn't have success flag, check if status was 200
        if (response.status === 200) {
          setSuccess('Profile updated successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(response.data?.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = Object.values(error.response.data.errors).flat();
        setError(errors.join(', '));
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="warning">
          <Alert.Heading>Please Login</Alert.Heading>
          <p>You need to be logged in to view your profile.</p>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading profile...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">My Profile</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          <Alert.Heading>Success</Alert.Heading>
          <p>{success}</p>
        </Alert>
      )}

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={formData.name}
                    className="rounded-circle img-fluid border border-3 border-primary"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                  >
                    {getInitials(formData.name)}
                  </div>
                )}
              </div>

              <h4>{formData.name || 'User'}</h4>
              <p className="text-muted mb-2">{formData.email || 'No email'}</p>
              
              <div className="mt-3">
                <span className="badge bg-success p-2">
                  <i className="bi bi-shield-check me-1"></i>
                  {profile?.status === 'active' ? 'Active Account' : 'Account Status: ' + (profile?.status || 'Unknown')}
                </span>
              </div>

              {profile?.auth0_id && (
                <div className="mt-3 text-start">
                  <small className="text-muted">Auth0 ID:</small>
                  <p className="small text-break">{profile.auth0_id}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Profile Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    readOnly
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed. Contact support if you need to update your email.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number (optional)"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your street address (optional)"
                  />
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
                        placeholder="City (optional)"
                      />
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
                        placeholder="State (optional)"
                      />
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
                        placeholder="Zip Code (optional)"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={saving}
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;