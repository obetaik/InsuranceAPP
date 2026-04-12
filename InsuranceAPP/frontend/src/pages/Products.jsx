import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner } from 'react-bootstrap';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) setSelectedCategory(cat);
    fetchProducts();
  }, [location]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/products');
      console.log('✅ Products response:', response.data);

      let productsData = [];

      if (response.data?.success && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        productsData = response.data;
      }

      setProducts(productsData);
      setFilteredProducts(productsData);

      // Extract unique categories from the 'category' field
      if (productsData.length > 0) {
        const uniqueCategories = ['All', ...new Set(
          productsData.map(p => p.category || 'Other')
        )].sort();
        setCategories(uniqueCategories);
      } else {
        setCategories(['All']);
      }

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => 
        (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

  const handleGetQuote = (productId) => {
    if (!isAuthenticated && import.meta.env.VITE_SKIP_AUTH !== 'true') {
      loginWithRedirect();
    } else {
      navigate(`/quotes/new?productId=${productId}`);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Auto': 'primary',
      'Home': 'success',
      'Life': 'info',
      'Health': 'warning',
      'Other': 'secondary'
    };
    return colors[category] || 'secondary';
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading insurance products...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error Loading Products</h4>
          <p>{error}</p>
          <Button variant="primary" onClick={fetchProducts}>Try Again</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Insurance Products</h2>
      <p className="text-muted mb-4">Choose from our range of insurance products to protect what matters most</p>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Filter by Category</Form.Label>
            <Form.Select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8}>
          <Form.Group>
            <Form.Label>Search Products</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Row className="mt-5">
          <Col className="text-center">
            <div className="py-5">
              <p className="text-muted mb-3">No products found matching your criteria.</p>
              <Button 
                variant="outline-primary" 
                onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
              >
                Clear Filters
              </Button>
            </div>
          </Col>
        </Row>
      ) : (
        <>
          <Row className="mb-3">
            <Col>
              <p className="text-muted">Showing {filteredProducts.length} of {products.length} products</p>
            </Col>
          </Row>
          <Row>
            {filteredProducts.map(product => (
              <Col md={4} key={product.id} className="mb-4">
                <Card className="h-100 shadow-sm hover-card">
                  <Card.Body>
                    <div className="mb-2">
                      <Badge bg={getCategoryColor(product.category)} className="me-2">
                        {product.category || 'Other'}
                      </Badge>
                    </div>
                    <Card.Title className="mt-2">{product.name}</Card.Title>
                    <Card.Text className="text-muted small">
                      {product.description}
                    </Card.Text>
                    <Card.Text>
                      <strong className="text-primary fs-4">
                        ${parseFloat(product.base_price).toFixed(2)}
                      </strong>
                      <span className="text-muted"> /year</span>
                    </Card.Text>
                    <Button 
                      variant="primary" 
                      onClick={() => handleGetQuote(product.id)}
                      className="w-100 mt-2"
                    >
                      Get Quote
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

export default Products;