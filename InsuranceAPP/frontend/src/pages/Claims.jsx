import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/claims');
      console.log('📊 Claims response:', response.data);
      
      let claimsData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        claimsData = response.data.data;
      }
      
      setClaims(claimsData);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError(error.response?.data?.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Submitted': 'info',
      'Under Review': 'warning',
      'Approved': 'success',
      'Rejected': 'danger',
      'Paid': 'primary'
    };
    return variants[status] || 'secondary';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading claims...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Claims</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchClaims}>Try Again</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Claims</h2>
        <Button as={Link} to="/claims/new" variant="primary">
          File New Claim
        </Button>
      </div>
      
      {claims.length === 0 ? (
        <Card className="text-center">
          <Card.Body className="py-5">
            <h5 className="mb-3">No Claims Filed</h5>
            <p className="text-muted mb-4">You haven't filed any claims yet.</p>
            <Button as={Link} to="/claims/new" variant="primary">
              File a Claim
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Table responsive hover>
          <thead className="bg-light">
            <tr>
              <th>Claim #</th>
              <th>Policy</th>
              <th>Incident Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(claim => (
              <tr key={claim.id}>
                <td><strong>{claim.claim_number}</strong></td>
                <td>{claim.policy?.policy_number || 'N/A'}</td>
                <td>{formatDate(claim.incident_date)}</td>
                <td>{formatCurrency(claim.claim_amount)}</td>
                <td>
                  <Badge bg={getStatusBadge(claim.status)}>
                    {claim.status}
                  </Badge>
                </td>
                <td>
                  <Button
                    as={Link}
                    to={`/claims/${claim.id}`}
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
      )}
    </Container>
  );
};

export default Claims;