import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { HistoryBootstrap } from './components/HistoryBootstrap';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <HistoryBootstrap />
        <RouterProvider router={router} />
      </AppProvider>
    </AuthProvider>
  );
}
