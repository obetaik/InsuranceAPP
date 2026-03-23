import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import QuoteDetail from './pages/QuoteDetail';
import NewQuote from './pages/NewQuote';
import Policies from './pages/Policies';
import PolicyDetail from './pages/PolicyDetail';
import Claims from './pages/Claims';
import ClaimDetail from './pages/ClaimDetail';
import NewClaim from './pages/NewClaim';
import Profile from './pages/Profile';

import Register from './pages/Register';

// Auth0 configuration
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
	scope: 'openid profile email', // Make sure email is here
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
};

// Route Debugger Component
function RouteDebugger() {
  const location = useLocation();
  
  React.useEffect(() => {
    console.log('📍 Route changed to:', location.pathname);
    console.log('📍 Search params:', location.search);
    console.log('📍 State:', location.state);
  }, [location]);

  return null;
}

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Something went wrong</Alert.Heading>
            <pre>{this.state.error?.toString()}</pre>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </button>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { isLoading, isAuthenticated, error } = useAuth();

  console.log('🔄 AppContent rendered:', { isLoading, isAuthenticated, error });

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Authentication Error</h4>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <RouteDebugger />
      {isAuthenticated && <Sidebar />}
      <main className={`main-content ${!isAuthenticated ? 'full-width' : ''}`}>
        <div className="content-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Protected Routes */}
            <Route
			  path="/dashboard"
			  element={
				<ProtectedRoute>
				  <Dashboard key="dashboard" />
				</ProtectedRoute>
			  }
			/>
            
            {/* Quotes Routes */}
            <Route
              path="/quotes"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Quotes />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/new"
              element={
                <ProtectedRoute>
                  <NewQuote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/:id"
              element={
                <ProtectedRoute>
                  <QuoteDetail />
                </ProtectedRoute>
              }
            />
            
            {/* Policies Routes */}
            <Route
              path="/policies"
              element={
                <ProtectedRoute>
                  <Policies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/policies/:id"
              element={
                <ProtectedRoute>
                  <PolicyDetail />
                </ProtectedRoute>
              }
            />
            
            {/* Claims Routes */}
            <Route
              path="/claims"
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Claims />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="/claims/new"
              element={
                <ProtectedRoute>
                  <NewClaim />
                </ProtectedRoute>
              }
            />
            <Route
              path="/claims/:id"
              element={
                <ProtectedRoute>
                  <ClaimDetail />
                </ProtectedRoute>
              }
            />
            
            {/* Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  console.log('🚀 App initialized with config:', auth0Config);

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={auth0Config.authorizationParams}
      cacheLocation={auth0Config.cacheLocation}
      useRefreshTokens={auth0Config.useRefreshTokens}
    >
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </Auth0Provider>
  );
}

export default App;