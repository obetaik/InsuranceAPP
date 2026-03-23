import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth0 = useAuth0();
  const { 
    getAccessTokenSilently, 
    isAuthenticated, 
    isLoading, 
    user, 
    error, 
    loginWithRedirect,
    logout: auth0Logout
  } = auth0;
  
  const [token, setToken] = useState(null);
  const [tokenError, setTokenError] = useState(null);

  console.log('🔐 AuthProvider state:', {
    isAuthenticated,
    isLoading,
    user: user?.email,
    error: error?.message,
    hasToken: !!token
  });

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          console.log('🔑 Attempting to get access token...');
          console.log('User:', user?.email);
          
          const accessToken = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
              scope: 'openid profile email'
            }
          });
          
          console.log('✅ Got access token, length:', accessToken.length);
          console.log('✅ Token preview:', accessToken.substring(0, 50) + '...');
          
          setToken(accessToken);
          localStorage.setItem('access_token', accessToken);
          setTokenError(null);
          
          console.log('💾 Token stored in localStorage');
          
        } catch (error) {
          console.error('❌ Error getting token:', error);
          setTokenError(error.message);
        }
      } else {
        console.log('🔓 User not authenticated, clearing token');
        setToken(null);
        localStorage.removeItem('access_token');
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  const login = () => {
    console.log('🚀 Initiating login with redirect...');
    loginWithRedirect({
      appState: { returnTo: window.location.pathname }
    });
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
    localStorage.removeItem('access_token');
    setToken(null);
  };

  const value = {
    ...auth0,
    token,
    tokenError,
    login,
    logout,
    isAuthenticated,
    isLoading,
    user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};