import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Increased timeout
  withCredentials: false,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log(`\n📤 ${config.method.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('access_token');
    
    if (token) {
      console.log('✅ Token found, length:', token.length);
      console.log('✅ Token preview:', token.substring(0, 50) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('❌ No token found in localStorage');
    }
    
    console.log('📋 Headers:', {
      ...config.headers,
      Authorization: config.headers.Authorization ? 'Bearer [HIDDEN]' : undefined
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    console.log('📦 Response data:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`\n❌ API Error: ${error.response.status} ${error.config?.url}`);
      console.error('Response data:', error.response.data);
      
      // Only redirect to login if it's a 401 AND not on login page
      if (error.response.status === 401 && !window.location.pathname.includes('/login')) {
        console.log('🔐 Unauthorized - redirecting to login');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('❌ No response received:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;