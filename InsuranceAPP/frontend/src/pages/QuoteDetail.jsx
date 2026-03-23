import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/quotes/${id}`);
      console.log('📊 Quote response:', response.data);
      
      if (response.data.success) {
        setQuote(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load quote');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setError(error.response?.data?.message || 'Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const response = await api.post('/policies', {
        quote_id: quote.id
      });
      
      if (response.data.success) {
        alert('Policy created successfully!');
        navigate('/policies');
      } else {
        alert(response.data.message || 'Failed to create policy');
      }
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert(error.response?.data?.message || 'Failed to create policy');
    } finally {
      setAccepting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Accepted': 'success',
      'Expired': 'danger'
    };
    return variants[status] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading quote details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Quote</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchQuote}>Try Again</Button>
          <Button as={Link} to="/quotes" variant="secondary" className="ms-2">Back to Quotes</Button>
        </Alert>
      </Container>
    );
  }

  if (!quote) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Quote Not Found</Alert.Heading>
          <p>The quote you're looking for doesn't exist.</p>
          <Button as={Link} to="/quotes" variant="primary">Back to Quotes</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quote Details</h2>
        <Button as={Link} to="/quotes" variant="outline-secondary">
          ← Back to Quotes
        </Button>
      </div>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Quote #{quote.quote_number || `Q-${quote.id}`}</h5>
                <Badge bg={getStatusBadge(quote.status)} className="fs-6">
                  {quote.status}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body>
              <h6 className="text-muted mb-3">Product Information</h6>
              <h4>{quote.product?.name || 'N/A'}</h4>
              <p className="text-muted">{quote.product?.description}</p>
              
              <hr />
              
              <h6 className="text-muted mb-3">Coverage Details</h6>
              <Row className="mb-2">
                <Col className="fw-bold">Coverage Amount:</Col>
                <Col>{formatCurrency(quote.coverage_amount)}</Col>
              </Row>
              <Row className="mb-2">
                <Col className="fw-bold">Deductible:</Col>
                <Col>{formatCurrency(quote.deductible)}</Col>
              </Row>
              {quote.additional_options && (
                <Row className="mb-2">
                  <Col className="fw-bold">Additional Options:</Col>
                  <Col>{quote.additional_options}</Col>
                </Row>
              )}
              
              <hr />
              
              <h6 className="text-muted mb-3">Premium Calculation</h6>
              <Row className="mb-2">
                <Col className="fw-bold">Base Price:</Col>
                <Col>{formatCurrency(quote.product?.base_price)}</Col>
              </Row>
              <Row className="mb-2">
                <Col className="fw-bold">Estimated Premium:</Col>
                <Col className="text-primary fw-bold fs-5">{formatCurrency(quote.estimated_premium)}</Col>
              </Row>
              <Row className="mb-2">
                <Col className="fw-bold">Valid Until:</Col>
                <Col>{formatDate(quote.expires_at)}</Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Actions</h5>
            </Card.Header>
            <Card.Body>
              {quote.status === 'Pending' ? (
                <>
                  <Button 
                    variant="success" 
                    className="w-100 mb-2"
                    onClick={handleAccept}
                    disabled={accepting}
                  >
                    {accepting ? 'Processing...' : 'Accept Quote & Create Policy'}
                  </Button>
                  <p className="text-muted small mt-2">
                    By accepting this quote, you will create a new insurance policy.
                  </p>
                </>
              ) : (
                <Alert variant="info">
                  This quote has already been {quote.status.toLowerCase()}.
                </Alert>
              )}
              
              <Button 
                as={Link} 
                to="/products" 
                variant="outline-primary" 
                className="w-100 mt-2"
              >
                Get Another Quote
              </Button>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quote Information</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2">
                <Col className="fw-bold">Created:</Col>
                <Col>{formatDate(quote.created_at)}</Col>
              </Row>
              <Row className="mb-2">
                <Col className="fw-bold">Last Updated:</Col>
                <Col>{formatDate(quote.updated_at)}</Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QuoteDetail;