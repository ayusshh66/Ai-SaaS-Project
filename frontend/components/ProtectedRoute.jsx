// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Replace 'isAuthenticated' with your actual logic (e.g., checking localStorage or a UserContext)
  const isAuthenticated = localStorage.getItem('token'); 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;