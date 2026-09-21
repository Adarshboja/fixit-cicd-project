import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintFormPage from './pages/ComplaintFormPage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ComplaintsPage from './pages/ComplaintsPage';
import SettingsPage from './pages/SettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import { getToken, isAdmin, isAuthenticated, logout as logoutUser } from './utils/auth';

export const AppContext = createContext();

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useContext(AppContext);
  const authenticated = !!user?.token || isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN' && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user } = useContext(AppContext);
  if (user?.token || isAuthenticated()) {
    return <Navigate to={user?.role === 'ADMIN' || isAdmin() ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

function App() {
  const [authState, setAuthState] = useState(() => {
    const storedUser = localStorage.getItem('fixit-user');
    const token = getToken();
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      token,
    };
  });

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isLoggedIn: !!authState.token,
      login: (userData) => {
        const normalizedUser = {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        };

        localStorage.setItem('fixit-token', userData.token);
        localStorage.setItem('fixit-user', JSON.stringify(normalizedUser));
        setAuthState({ user: normalizedUser, token: userData.token });
      },
      logout: () => {
        logoutUser();
        setAuthState({ user: null, token: '' });
      },
    }),
    [authState]
  );

  useEffect(() => {
    const handleStorage = () => {
      const token = getToken();
      const storedUser = localStorage.getItem('fixit-user');
      setAuthState({
        token,
        user: storedUser ? JSON.parse(storedUser) : null,
      });
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <AppContext.Provider value={value}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/complaints/new" element={<ComplaintFormPage />} />
          <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route element={<ProtectedRoute adminOnly><AuthenticatedLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/complaints" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
