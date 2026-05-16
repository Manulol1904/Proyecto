import { createBrowserRouter, Navigate } from 'react-router';
import { Layout } from './components/Layout';
import { UploadDashboard } from './components/UploadDashboard';
import { AnalysisResults } from './components/AnalysisResults';
import { LoginPage } from './components/LoginPage';
import { useAuth } from './context/AuthContext';

function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-10 h-10" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#1a7a4a" strokeWidth="4" />
            <path className="opacity-80" fill="#1a7a4a" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Cargando FreshCheck…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
}

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
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
