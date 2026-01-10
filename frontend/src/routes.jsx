import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

const queryClient = new QueryClient();

// Wrapper component for dashboard pages
function DashboardPageWrapper({ children }) {
  const { user, logout } = useAuth();
  return (
    <DashboardLayout onLogout={logout} userName={user?.name || 'User'}>
      {children}
    </DashboardLayout>
  );
}

const router = createBrowserRouter([
  { 
    path: '/login', 
    element: <Login /> 
  },
  { 
    path: '/', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <Dashboard />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/dashboard', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <Dashboard />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/employees', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <Employees />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/departments', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <Departments />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/attendance', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <Attendance />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/leave-requests', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <LeaveRequests />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

export default function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
