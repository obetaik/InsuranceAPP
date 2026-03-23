import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function PolicyDetail() {
  const [policy, setPolicy] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPolicy();
  }, [id]);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📊 Fetching policy details for ID:', id);
      const response = await api.get(`/policies/${id}`);
      console.log('✅ Policy response:', response.data);
      
      // Handle the response structure correctly
      if (response.data && response.data.success) {
        setPolicy(response.data.data);
      } else if (response.data && !response.data.success) {
        setError(response.data.message || 'Failed to load policy');
      } else {
        setPolicy(response.data);
      }
      
    } catch (error) {
      console.error('❌ Error fetching policy:', error);
      setError(error.response?.data?.message || 'Failed to load policy details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      console.log('📊 Payments response:', response.data);
      
      let paymentsData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        paymentsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        paymentsData = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        paymentsData = response.data;
      }
      
      // Filter payments for this policy
      const policyPayments = paymentsData.filter(p => 
        p.policy_id === policy?.id || p.policy_number === policy?.policy_number
      );
      setPayments(policyPayments);
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Don't set error here - payments are optional
    }
  };

  // Fetch payments after policy is loaded
  useEffect(() => {
    if (policy) {
      fetchPayments();
    }
  }, [policy]);

  const handleMakePayment = async () => {
    try {
      const response = await api.post(`/policies/${policy.id}/payments`, {
        payment_method: 'Credit Card'
      });
      console.log('✅ Payment response:', response.data);
      alert('Payment successful!');
      fetchPayments();
    } catch (error) {
      console.error('Error making payment:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  const handleFileClaim = () => {
    navigate(`/claims/new?policyId=${policy.id}`);
  };

  const isActive = () => {
    if (!policy) return false;
    return policy.status === 'Active' && new Date(policy.end_date) > new Date();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading policy details...</p>
      </Container>
    );
  }

  if (error || !policy) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error || 'Policy not found'}</Alert>
        <Button as={Link} to="/policies" variant="primary">
          Back to Policies
        </Button>
      </Container>
    );
  }

  const product = policy.product || {};
  const isPolicyActive = isActive();

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Policy Details</h2>
          <p className="text-muted">Policy #{policy.policy_number}</p>
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/policies" variant="outline-secondary">
            ← Back to Policies
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Policy Information</h5>
            </Card.Header>
            <Card.Body>
              <Table borderless>
                <tbody>
                  <tr>
                    <td className="fw-bold" style={{ width: '200px' }}>Status:</td>
                    <td>
                      <Badge bg={isPolicyActive ? 'success' : 'danger'}>
                        {isPolicyActive ? 'Active' : policy.status || 'Expired'}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Product:</td>
                    <td>{product.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Category:</td>
                    <td>{product.category || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Premium Amount:</td>
                    <td>
                      <h4 className="text-primary mb-0">
                        {formatCurrency(policy.premium_amount)}/year
                      </h4>
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Start Date:</td>
                    <td>{formatDate(policy.start_date)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">End Date:</td>
                    <td>{formatDate(policy.end_date)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Effective Date:</td>
                    <td>{formatDate(policy.effective_date)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Created:</td>
                    <td>{formatDate(policy.created_at)}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Coverage Details</h5>
            </Card.Header>
            <Card.Body>
              <p>{product.coverage_details || product.description || 'Standard coverage included.'}</p>
              <h6 className="mt-3">What's Covered:</h6>
              <ul>
                <li>Liability protection</li>
                <li>Property damage</li>
                <li>Medical payments</li>
                <li>Personal injury protection</li>
              </ul>
            </Card.Body>
          </Card>

          {payments.length > 0 && (
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Payment History</h5>
              </Card.Header>
              <Card.Body>
                <Table striped hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.transaction_id || 'N/A'}</td>
                        <td>{formatDate(payment.payment_date)}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>{payment.payment_method || 'Credit Card'}</td>
                        <td>
                          <Badge bg="success">{payment.status || 'Completed'}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Actions</h5>
            </Card.Header>
            <Card.Body>
              {isPolicyActive ? (
                <>
                   
                  <Button 
                    variant="warning" 
                    className="w-100 mb-2"
                    onClick={handleFileClaim}
                  >
                    File a Claim
                  </Button>
                  
                </>
              ) : (
                <Alert variant="warning">
                  This policy has {policy.status?.toLowerCase() || 'expired'}. Please contact support to renew.
                </Alert>
              )}
              
              <hr />
              
              <Button 
                variant="outline-secondary" 
                className="w-100"
                as={Link}
                to={`/claims?policyId=${policy.id}`}
              >
                View Related Claims
              </Button>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Need Help?</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Contact our support team for assistance with your policy.
              </p>
              <Button variant="outline-primary" className="w-100">
                Contact Support
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PolicyDetail;