import { useState, lazy, Suspense, useEffect } from 'react';
import api from './utils/axiosConfig';
import { ToastProvider } from './components/shared/UIHelpers';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Facilities from './components/Facilities';
import Equipment from './components/Equipment';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import BookingFlow from './components/booking/BookingFlow';

const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const PemilikDashboard = lazy(() => import('./components/pemilik/PemilikDashboard'));
const TeknisiDashboard = lazy(() => import('./components/teknisi/TeknisiDashboard'));
const KasirDashboard = lazy(() => import('./components/kasir/KasirDashboard'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-warm-gray text-sm">Memuat dashboard...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setCurrentView(user.role);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const goToLanding = () => {
    setCurrentView('landing');
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setCurrentView('landing');
    }
  };

  if (currentView === 'admin') {
    return <Suspense fallback={<LoadingScreen />}><AdminDashboard onLogout={handleLogout} user={currentUser} /></Suspense>;
  }
  if (currentView === 'pemilik') {
    return <Suspense fallback={<LoadingScreen />}><PemilikDashboard onLogout={handleLogout} user={currentUser} /></Suspense>;
  }
  if (currentView === 'teknisi') {
    return <Suspense fallback={<LoadingScreen />}><TeknisiDashboard onLogout={handleLogout} user={currentUser} /></Suspense>;
  }
  if (currentView === 'kasir') {
    return <Suspense fallback={<LoadingScreen />}><KasirDashboard onLogout={handleLogout} user={currentUser} /></Suspense>;
  }

  if (currentView === 'booking') {
    return <BookingFlow onClose={goToLanding} />;
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar
        onBookNow={() => setCurrentView('booking')}
        onLogin={(role, user) => {
          setCurrentUser(user);
          setCurrentView(role);
        }}
      />
      <Hero />
      <Facilities onBookSession={() => setCurrentView('booking')} />
      <Equipment />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default function App() {
  return <ToastProvider><AppContent /></ToastProvider>;
}
