import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Render a loading indicator
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-opacity-50 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render the child components if authenticated
  return <>{children}</>;
} 