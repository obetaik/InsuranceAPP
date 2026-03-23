import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/quotes');
      console.log('📊 Quotes response:', response.data);
      
      // Fix: Extract the array correctly
      let quotesData = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        quotesData = response.data.data;
        console.log('✅ Extracted from response.data.data');
      } else if (Array.isArray(response.data)) {
        quotesData = response.data;
        console.log('✅ Extracted from response.data');
      } else if (response.data && Array.isArray(response.data)) {
        quotesData = response.data;
        console.log('✅ Extracted from response.data');
      }
      
      console.log('📦 Processed quotes count:', quotesData.length);
      setQuotes(quotesData);
      
    } catch (error) {
      console.error('❌ Error fetching quotes:', error);
      setError(error.response?.data?.message || 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pending': 'warning',
      'Accepted': 'success',
      'Expired': 'danger',
      'pending': 'warning',
      'accepted': 'success',
      'expired': 'danger'
    };
    return variants[status] || 'secondary';
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

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading quotes...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Quotes</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchQuotes}>Try Again</Button>
        </Alert>
      </Container>
    );
  }

  if (quotes.length === 0) {
    return (
      <Container>
        <h2 className="mb-4">My Quotes</h2>
        <Card className="text-center">
          <Card.Body className="py-5">
            <h5 className="mb-3">No Quotes Yet</h5>
            <p className="text-muted mb-4">You haven't created any insurance quotes yet.</p>
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
      <h2 className="mb-4">My Quotes</h2>
      <p className="text-muted mb-4">View and manage your insurance quotes</p>
      
      <Table responsive hover className="shadow-sm">
        <thead className="bg-light">
          <tr>
            <th>Quote #</th>
            <th>Product</th>
            <th>Coverage Amount</th>
            <th>Premium</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(quote => (
            <tr key={quote.id}>
              <td>
                <strong>{quote.quote_number || `Q-${quote.id}`}</strong>
              </td>
              <td>{quote.product?.name || quote.product_name || 'N/A'}</td>
              <td>{formatCurrency(quote.coverage_amount)}</td>
              <td className="text-primary fw-bold">
                {formatCurrency(quote.estimated_premium || quote.calculated_price)}
              </td>
              <td>
                <Badge bg={getStatusBadge(quote.status)}>
                  {quote.status}
                </Badge>
              </td>
              <td>{formatDate(quote.created_at)}</td>
              <td>
                <Button
                  as={Link}
                  to={`/quotes/${quote.id}`}
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

export default Quotes;