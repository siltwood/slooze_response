import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import Layout from './components/Layout';
import './App.css';

// Protected Route Component - Ensures user is authenticated and has required role
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const { state } = useAuth();

  // Redirect to login if not authenticated
  if (!state.user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to products if user doesn't have required role (e.g., non-Manager trying to access Dashboard)
  if (requiredRole && state.user.role !== requiredRole) {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};

// Public Route Component - Redirects authenticated users away from login/register pages
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useAuth();

  // If user is logged in, redirect to appropriate home page based on role
  if (state.user) {
    return <Navigate to={state.user.role === 'Manager' ? '/dashboard' : '/products'} replace />;
  }

  return <>{children}</>;
};

// App Routes Component - Defines all application routes with proper protection
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes - Login & Registration */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterForm />
          </PublicRoute>
        } 
      />
      
      {/* Protected Routes - Require Authentication */}
      
      {/* Dashboard - Manager Only */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole="Manager">
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Products - Both Managers and Store Keepers */}
      <Route 
        path="/products" 
        element={
          <ProtectedRoute>
            <Layout>
              <ProductList />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Main App Component - Root component with providers
function App() {
  return (
    // Language Provider - Manages language state and translations across the app
    <LanguageProvider>
      {/* Theme Provider - Manages light/dark mode across the app */}
      <ThemeProvider>
        {/* Auth Provider - Manages authentication state and user session */}
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
