import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const NewQuote = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { getAccessTokenSilently, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    coverage_amount: 100000,
    deductible: 500,
    additional_options: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      
      // Handle response structure correctly
      let productsData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        productsData = response.data;
      }
      
      setProducts(productsData);
      
      // If productId is provided, select that product
      if (productId && productsData.length > 0) {
        const product = productsData.find(p => p.id === parseInt(productId));
        if (product) {
          setSelectedProduct(product);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
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

  const calculatePremium = () => {
    if (!selectedProduct) return 0;
    
    const basePrice = parseFloat(selectedProduct.base_price);
    const coverageAmount = parseFloat(formData.coverage_amount);
    const deductible = parseFloat(formData.deductible);
    
    // Simple calculation: base price * (coverage/100000) * (1 - deductible/10000)
    const premium = basePrice * (coverageAmount / 100000) * (1 - (deductible / 10000));
    return Math.max(premium, basePrice * 0.5); // Minimum 50% of base price
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const token = await getAccessTokenSilently();
      const premium = calculatePremium();
      
      const quoteData = {
        insurance_product_id: selectedProduct.id,
        coverage_amount: parseFloat(formData.coverage_amount),
        deductible: parseFloat(formData.deductible),
        calculated_price: premium,
        additional_options: formData.additional_options || null
      };
      
      const response = await api.post('/quotes', quoteData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Quote generated successfully!');
        setTimeout(() => {
          navigate('/quotes');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to generate quote');
      }
    } catch (error) {
      console.error('Error generating quote:', error);
      setError(error.response?.data?.message || 'Failed to generate quote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading products...</p>
      </Container>
    );
  }

  if (!selectedProduct && products.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>No Products Available</Alert.Heading>
          <p>Please check back later for insurance products.</p>
        </Alert>
      </Container>
    );
  }

  if (!selectedProduct && products.length > 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info">
          <Alert.Heading>Select a Product</Alert.Heading>
          <p>Please select a product to get a quote.</p>
          <div className="d-flex gap-2">
            {products.map(product => (
              <Button 
                key={product.id} 
                variant="outline-primary"
                onClick={() => setSelectedProduct(product)}
              >
                {product.name}
              </Button>
            ))}
          </div>
        </Alert>
      </Container>
    );
  }

  const premium = calculatePremium();

  return (
    <Container>
      <h2 className="mb-4">New Quote Request</h2>
      
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
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">{selectedProduct?.name}</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">{selectedProduct?.description}</p>
              <p><strong>Base Price:</strong> ${parseFloat(selectedProduct?.base_price).toFixed(2)}/year</p>
              
              <hr />
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Coverage Amount ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="coverage_amount"
                    value={formData.coverage_amount}
                    onChange={handleInputChange}
                    min={10000}
                    max={1000000}
                    step={10000}
                    required
                  />
                  <Form.Text className="text-muted">
                    Minimum: $10,000, Maximum: $1,000,000
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Deductible ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="deductible"
                    value={formData.deductible}
                    onChange={handleInputChange}
                    min={0}
                    max={5000}
                    step={100}
                    required
                  />
                  <Form.Text className="text-muted">
                    Higher deductible = Lower premium
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Additional Options</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="additional_options"
                    value={formData.additional_options}
                    onChange={handleInputChange}
                    placeholder="Any additional coverage needs or special requirements?"
                  />
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={submitting}
                    size="lg"
                  >
                    {submitting ? 'Generating...' : 'Generate Quote'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/products')}
                  >
                    Back to Products
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={5}>
          <Card className="bg-light">
            <Card.Header>
              <h5 className="mb-0">Quote Summary</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col>Base Price:</Col>
                <Col className="text-end">
                  ${parseFloat(selectedProduct?.base_price).toFixed(2)}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>Coverage Amount:</Col>
                <Col className="text-end">
                  ${parseInt(formData.coverage_amount).toLocaleString()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>Deductible:</Col>
                <Col className="text-end">
                  ${parseInt(formData.deductible).toLocaleString()}
                </Col>
              </Row>
              <hr />
              <Row className="mb-3">
                <Col><strong>Estimated Premium:</strong></Col>
                <Col className="text-end">
                  <strong className="text-primary fs-4">
                    ${premium.toFixed(2)}
                  </strong>
                </Col>
              </Row>
              <Row>
                <Col><small className="text-muted">per year</small></Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NewQuote;