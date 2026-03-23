import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const NewClaim = () => {
  const [searchParams] = useSearchParams();
  const policyIdParam = searchParams.get('policyId');
  
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { getAccessTokenSilently } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    incident_date: '',
    description: '',
    claim_amount: ''
  });

  useEffect(() => {
    fetchUserPolicies();
  }, []);

  const fetchUserPolicies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/policies');
      console.log('📊 Policies response:', response.data);
      
      // Handle response structure correctly
      let policiesData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        policiesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        policiesData = response.data;
      }
      
      setPolicies(policiesData);
      
      // If policyId is provided, select that policy
      if (policyIdParam && policiesData.length > 0) {
        const policy = policiesData.find(p => p.id === parseInt(policyIdParam));
        if (policy) {
          setSelectedPolicy(policy);
        }
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      setError('Failed to load policies');
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
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = await getAccessTokenSilently();
      
      const claimData = {
        policy_id: selectedPolicy.id,
        incident_date: formData.incident_date,
        description: formData.description,
        claim_amount: parseFloat(formData.claim_amount)
      };
      
      const response = await api.post('/claims', claimData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Claim submitted successfully!');
        setTimeout(() => {
          navigate('/claims');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to submit claim');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your policies...</p>
      </Container>
    );
  }

  if (policies.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>No Active Policies</Alert.Heading>
          <p>You need an active policy to file a claim.</p>
          <Button as={Link} to="/products" variant="primary">
            Browse Products
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">File a New Claim</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      <Row>
        <Col md={7}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Claim Information</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Policy</Form.Label>
                  <Form.Select
                    value={selectedPolicy?.id || ''}
                    onChange={(e) => {
                      const policy = policies.find(p => p.id === parseInt(e.target.value));
                      setSelectedPolicy(policy);
                    }}
                    required
                  >
                    <option value="">Choose a policy...</option>
                    {policies.map(policy => (
                      <option key={policy.id} value={policy.id}>
                        {policy.policy_number} - {policy.product?.name || 'N/A'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Incident Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="incident_date"
                    value={formData.incident_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Claim Amount ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="claim_amount"
                    value={formData.claim_amount}
                    onChange={handleInputChange}
                    placeholder="Enter claim amount"
                    min={0}
                    step={100}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description of Incident</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Please describe what happened..."
                    required
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={submitting || !selectedPolicy}
                  className="w-100"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={5}>
          {selectedPolicy && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Selected Policy</h5>
              </Card.Header>
              <Card.Body>
                <p><strong>Policy #:</strong> {selectedPolicy.policy_number}</p>
                <p><strong>Product:</strong> {selectedPolicy.product?.name || 'N/A'}</p>
                <p><strong>Premium:</strong> ${selectedPolicy.premium_amount?.toLocaleString()}</p>
                <p><strong>Status:</strong> {selectedPolicy.status}</p>
                <hr />
                <p><strong>Coverage Details:</strong></p>
                <p className="text-muted small">
                  {selectedPolicy.product?.description || 'Standard coverage applies'}
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default NewClaim;