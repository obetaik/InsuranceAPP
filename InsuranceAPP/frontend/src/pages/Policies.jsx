import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/policies');
      console.log('📊 Policies response:', response.data);
      
      // Extract the array correctly
      let policiesData = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        policiesData = response.data.data;
        console.log('✅ Extracted from response.data.data');
      } else if (Array.isArray(response.data)) {
        policiesData = response.data;
        console.log('✅ Extracted from response.data');
      } else if (response.data && Array.isArray(response.data)) {
        policiesData = response.data;
        console.log('✅ Extracted from response.data');
      }
      
      console.log('📦 Processed policies count:', policiesData.length);
      setPolicies(policiesData);
      
    } catch (error) {
      console.error('❌ Error fetching policies:', error);
      setError(error.response?.data?.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
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
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Active': 'success',
      'Expired': 'danger',
      'Cancelled': 'secondary'
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading policies...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Policies</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchPolicies}>Try Again</Button>
        </Alert>
      </Container>
    );
  }

  if (policies.length === 0) {
    return (
      <Container>
        <h2 className="mb-4">My Policies</h2>
        <Card className="text-center">
          <Card.Body className="py-5">
            <h5 className="mb-3">No Active Policies</h5>
            <p className="text-muted mb-4">You haven't purchased any insurance policies yet.</p>
            <Button as={Link} to="/products" variant="primary">
              Browse Products
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">My Policies</h2>
      <p className="text-muted mb-4">View and manage your insurance policies</p>
      
      <Table responsive hover className="shadow-sm">
        <thead className="bg-light">
          <tr>
            <th>Policy #</th>
            <th>Product</th>
            <th>Premium</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.map(policy => (
            <tr key={policy.id}>
              <td>
                <strong>{policy.policy_number}</strong>
              </td>
              <td>{policy.product?.name || policy.product_name || 'N/A'}</td>
              <td className="text-primary fw-bold">
                {formatCurrency(policy.premium_amount)}
              </td>
              <td>{formatDate(policy.start_date)}</td>
              <td>{formatDate(policy.end_date)}</td>
              <td>
                <Badge bg={getStatusBadge(policy.status)}>
                  {policy.status}
                </Badge>
              </td>
              <td>
                <Button
                  as={Link}
                  to={`/policies/${policy.id}`}
                  variant="outline-primary"
                  size="sm"
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <div className="mt-3">
        <Button as={Link} to="/products" variant="primary">
          Get New Quote
        </Button>
      </div>
    </Container>
  );
};

export default Policies;