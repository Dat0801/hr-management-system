import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

/**
 * ProtectedRoute component - wraps routes that require authentication
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { token, user, isLoading } = useAuth();

  // Still loading auth state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // No token - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Authorized - render children
  return children;
}
