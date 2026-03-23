import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
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
  
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
    fetchProducts();
  }, [location]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(response.data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter products based on category and search term
    let filtered = products;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.coverage_details.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Insurance Products</h2>
      
      {/* Filters */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Category</Form.Label>
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
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Products Grid */}
      <Row>
        {filteredProducts.length === 0 ? (
          <Col>
            <p className="text-center">No products found matching your criteria.</p>
          </Col>
        ) : (
          filteredProducts.map(product => (
            <Col md={4} key={product.id} className="mb-4">
              <Card className="h-100 card-hover">
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {product.category}
                  </Card.Subtitle>
                  <Card.Text>
                    {product.coverage_details}
                  </Card.Text>
                  <Card.Text>
                    <strong className="text-primary">
                      Starting at: ${product.base_price}/year
                    </strong>
                  </Card.Text>
                  <Button 
                    variant="primary" 
                    onClick={() => handleGetQuote(product.id)}
                    className="w-100"
                  >
                    Get Quote
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}

export default Products;