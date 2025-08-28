import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext.jsx';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="275920586632-6i1av7svd4lk5d3lbdagnoa7vi566v3b.apps.googleusercontent.com">
    <AuthProvider>
        <HelmetProvider>
          <App />
        </HelmetProvider>
    </AuthProvider>
  </GoogleOAuthProvider>
);
