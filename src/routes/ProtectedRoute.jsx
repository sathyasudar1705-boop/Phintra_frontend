import React from 'react';
import { Navigate } from 'react-router-dom';

export const AdminProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('adminRole');
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';

  if (!token || !isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Admin roles in frontend are 'Security Administrator' or 'Security Manager'
  const isAdminRole = role === 'Security Administrator' || role === 'Security Manager';
  if (!isAdminRole) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'Security Manager') {
      return <Navigate to="/admin/manager-dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export const EmployeeProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('employeeToken');
  const role = localStorage.getItem('employeeRole');
  const isAuthenticated = localStorage.getItem('employeeAuth') === 'true';

  if (!token || !isAuthenticated) {
    return <Navigate to="/user/login" replace />;
  }

  if (role !== 'Employee') {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

// Keep default export pointing to AdminProtectedRoute for backward compatibility if imported elsewhere
export default AdminProtectedRoute;
