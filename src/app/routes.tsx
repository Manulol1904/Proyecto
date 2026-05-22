import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { UploadDashboard } from './components/UploadDashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { LoginPage } from './components/LoginPage';
import { AuthLoading } from './components/AuthLoading';
import { useAuth } from './context/AuthContext';

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <LoginPage />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginRoute,
  },
  {
    path: '/',
    Component: ProtectedLayout,
    children: [
      { index: true, Component: UploadDashboard },
      { path: 'results', Component: AnalysisResults },
    ],
  },
]);
