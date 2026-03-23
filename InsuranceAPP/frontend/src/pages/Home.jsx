import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const features = [
    {
      icon: '🚗',
      title: 'Auto Insurance',
      description: 'Comprehensive coverage for your vehicle with flexible options and competitive rates.',
      link: '/products?category=Auto'
    },
    {
      icon: '🏠',
      title: 'Home Insurance',
      description: 'Protect your home and belongings with our comprehensive home insurance plans.',
      link: '/products?category=Home'
    },
    {
      icon: '❤️',
      title: 'Life Insurance',
      description: 'Secure your family\'s future with our life insurance options.',
      link: '/products?category=Life'
    },
    {
      icon: '⚕️',
      title: 'Health Insurance',
      description: 'Quality health coverage for you and your family.',
      link: '/products?category=Health'
    }
  ];

  return (
    <Container>
      {/* Hero Section */}
      <Row className="text-center mb-5 mt-4">
        <Col>
          <h1 className="display-4">Welcome to Personal Insurance App</h1>
          <p className="lead">
            Protecting what matters most - your family, home, and future
          </p>
          {!isAuthenticated && (
            <div className="mt-3">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => loginWithRedirect()}
                className="me-2"
              >
                Sign In
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg" 
                as={Link}
                to="/register"
              >
                Create Account
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <Button 
              variant="primary" 
              size="lg" 
              as={Link}
              to="/dashboard"
              className="mt-3"
            >
              Go to Dashboard
            </Button>
          )}
        </Col>
      </Row>

      {/* Features Section */}
      <Row className="mb-5">
        <Col>
          <h2 className="text-center mb-4">Our Insurance Products</h2>
        </Col>
      </Row>

      <Row>
        {features.map((feature, index) => (
          <Col md={3} key={index} className="mb-4">
            <Card className="h-100 text-center card-hover">
              <Card.Body>
                <div style={{ fontSize: '3rem' }}>{feature.icon}</div>
                <Card.Title>{feature.title}</Card.Title>
                <Card.Text>{feature.description}</Card.Text>
                
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Why Choose Us Section */}
      <Row className="mt-5 bg-light p-5 rounded">
        <Col md={6}>
          <h3>Why Choose InsuranceApp?</h3>
          <ul className="list-unstyled">
            <li className="mb-3">✓ Quick and easy quote process</li>
            <li className="mb-3">✓ 24/7 claims support</li>
            <li className="mb-3">✓ Competitive rates</li>
            <li className="mb-3">✓ Flexible payment options</li>
            <li className="mb-3">✓ Digital policy management</li>
          </ul>
        </Col>
        <Col md={6}>
          <h3>Get a Quote in Minutes</h3>
          <p>
            Our simple online process makes it easy to get the coverage you need.
            Compare rates, customize your coverage, and purchase online - all from
            the comfort of your home.
          </p>
          <div className="mt-3">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="primary" 
                  onClick={() => loginWithRedirect()}
                  className="me-2"
                >
                  Sign In to Get Quote
                </Button>
                <Button 
                  variant="outline-primary" 
                  as={Link}
                  to="/register"
                >
                  Create Account
                </Button>
              </>
            ) : (
              <Button 
                variant="primary" 
                as={Link}
                to="/products"
              >
                Get Your Quote Now
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;