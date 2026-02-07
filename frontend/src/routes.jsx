import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import Payroll from './pages/Payroll';
import PerformanceReviews from './pages/PerformanceReviews';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import JobPositions from './pages/JobPositions';
import JobApplications from './pages/JobApplications';
import Interviews from './pages/Interviews';
import JobOffers from './pages/JobOffers';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

const queryClient = new QueryClient();

// Wrapper component for dashboard pages
function DashboardPageWrapper({ children }) {
  const { user } = useAuth();
  return (
    <DashboardLayout userName={user?.name || 'User'}>
      {children}
    </DashboardLayout>
  );
}

const router = createBrowserRouter(
  [
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
    path: '/payroll', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <Payroll />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/performance-reviews', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <PerformanceReviews />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/goals', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <Goals />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/reports', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <Reports />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/job-positions', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <JobPositions />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/job-applications', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <JobApplications />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/interviews', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <Interviews />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  { 
    path: '/job-offers', 
    element: (
      <ProtectedRoute>
        <DashboardPageWrapper>
          <JobOffers />
        </DashboardPageWrapper>
      </ProtectedRoute>
    ) 
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
],
{
  future: {
    v7_startTransition: true
  }
});

export default function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
