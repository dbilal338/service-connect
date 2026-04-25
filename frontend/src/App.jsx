import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import InstallPrompt from './components/InstallPrompt';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse';
import ProviderProfile from './pages/ProviderProfile';
import ConsumerDashboard from './pages/ConsumerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import OrderDetail from './pages/OrderDetail';
import ChatPage from './pages/ChatPage';
import OffersPage from './pages/OffersPage';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center" style={{ height: '60vh' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-scroll">
        <Routes>
          <Route path="/"                    element={<Home />} />
          <Route path="/login"               element={<Login />} />
          <Route path="/register"            element={<Register />} />
          <Route path="/browse"              element={<Browse />} />
          <Route path="/offers"              element={<OffersPage />} />
          <Route path="/providers/:id"       element={<ProviderProfile />} />
          <Route path="/chat"                element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:id"            element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/dashboard"           element={<ProtectedRoute role="consumer"><ConsumerDashboard /></ProtectedRoute>} />
          <Route path="/provider-dashboard"  element={<ProtectedRoute role="provider"><ProviderDashboard /></ProtectedRoute>} />
          <Route path="/orders/:id"          element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        </Routes>
      </main>
      {user && <BottomNav />}
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
