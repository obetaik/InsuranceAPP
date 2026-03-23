import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';


function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// Add this at the top of your Dashboard component
	const [renderKey, setRenderKey] = useState(0);

	useEffect(() => {
	  console.log('📊 Dashboard mounted with key:', renderKey);
	  
	  // Force re-render on unmount/mount
	  return () => {
		console.log('📊 Dashboard unmounting');
		setRenderKey(prev => prev + 1);
	  };
	}, []);

  useEffect(() => {
    console.log('📊 Dashboard mounted');
    fetchDashboard();
    
    // Cleanup function
    return () => {
      console.log('📊 Dashboard unmounting');
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching dashboard data...');
      const response = await api.get('/dashboard');
      console.log('✅ Dashboard data received:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('❌ Error fetching dashboard:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Active': 'success',
      'Pending': 'warning',
      'Expired': 'danger',
      'Submitted': 'info',
      'Accepted': 'success'
    };
    return variants[status] || 'secondary';
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading your dashboard...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchDashboard}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>No Data Available</Alert.Heading>
          <p>Unable to load dashboard data.</p>
        </Alert>
      </Container>
    );
  }

  const { summary, recent_policies = [], recent_quotes = [] } = dashboardData;

  return (
    <Container>
      <h2 className="mb-4">Dashboard</h2>
      
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center bg-primary text-white">
            <Card.Body>
              <Card.Title>Active Policies</Card.Title>
              <h3 className="display-4">{summary?.active_policies || 0}</h3>
              <Button as={Link} to="/policies" variant="light" size="sm" className="mt-2">
                View All Policies
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center bg-warning">
            <Card.Body>
              <Card.Title>Pending Quotes</Card.Title>
              <h3 className="display-4">{summary?.pending_quotes || 0}</h3>
              <Button as={Link} to="/quotes" variant="dark" size="sm" className="mt-2">
                View All Quotes
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center bg-info text-white">
            <Card.Body>
              <Card.Title>Open Claims</Card.Title>
              <h3 className="display-4">{summary?.open_claims || 0}</h3>
              <Button as={Link} to="/claims" variant="light" size="sm" className="mt-2">
                View All Claims
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h5>Quick Actions</h5>
              <Button as={Link} to="/products" variant="primary" className="me-2">
                Get New Quote
              </Button>
              <Button as={Link} to="/claims/new" variant="outline-primary" className="me-2">
                File a Claim
              </Button>
              <Button as={Link} to="/profile" variant="outline-secondary">
                Update Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Policies */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Policies</h5>
              <Button as={Link} to="/policies" variant="link" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {recent_policies.length === 0 ? (
                <p className="text-muted text-center">No recent policies</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Policy #</th>
                      <th>Product</th>
                      <th>Premium</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_policies.map(policy => (
                      <tr key={policy.id}>
                        <td>
                          <Link to={`/policies/${policy.id}`}>
                            {policy.policy_number}
                          </Link>
                        </td>
                        <td>{policy.product_name}</td>
                        <td>{formatCurrency(policy.premium_amount)}</td>
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
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Quotes */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Quotes</h5>
              <Button as={Link} to="/quotes" variant="link" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {recent_quotes.length === 0 ? (
                <p className="text-muted text-center">No recent quotes</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Quote #</th>
                      <th>Product</th>
                      <th>Premium</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_quotes.map(quote => (
                      <tr key={quote.id}>
                        <td>
                          <Link to={`/quotes/${quote.id}`}>
                            {quote.quote_number}
                          </Link>
                        </td>
                        <td>{quote.product_name}</td>
                        <td>{formatCurrency(quote.calculated_price)}</td>
                        <td>
                          <Badge bg={getStatusBadge(quote.status)}>
                            {quote.status}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            as={Link} 
                            to={`/quotes/${quote.id}`} 
                            variant="outline-primary" 
                            size="sm"
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;