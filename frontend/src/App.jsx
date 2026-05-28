import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

// PWA Components
import SplashScreen from './components/PWA/SplashScreen';
import InstallAppButton from './components/PWA/InstallAppButton';
import OfflineFallback from './components/PWA/OfflineFallback';
import { onMessageListener } from './services/pushNotifications';
import AnnouncementBanner from './components/AnnouncementBanner';

import LandingPage from './pages/LandingPage';
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const BookDetailsPage = lazy(() => import('./pages/BookDetailsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const BestSellersPage = lazy(() => import('./pages/BestSellersPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const StorePage = lazy(() => import('./pages/StorePage'));
const InvoicePreview = lazy(() => import('./pages/InvoicePreview'));

import AnimatedBackground from './components/AnimatedBackground';
import BookLoader from './components/BookLoader';
import ActivityTracker from './components/ActivityTracker';
import './index.css';

const Layout = ({ children, showFooter = true, showNavbar = true }) => (
  <div className="relative flex flex-col min-h-screen">
    <AnimatedBackground />
    {showNavbar && <Navbar />}
    <main className={`relative flex-1 ${showNavbar ? 'pt-24 md:pt-28' : 'pt-0'}`}>
      <AnnouncementBanner />
      {children}
    </main>
    {showFooter && <Footer />}
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Background listener for Push Notifications in foreground
    onMessageListener().then((payload) => {
      console.log('Notification received in Foreground:', payload);
    }).catch(err => console.log('Notification listener error:', err));
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        {/* Custom Splash Screen */}
        <SplashScreen onReady={() => setShowSplash(false)} isVisible={showSplash} />

        <div
          style={{
            opacity: showSplash ? 0 : 1,
            transition: 'opacity 0.5s ease',
            height: showSplash ? '100vh' : 'auto',
            overflow: showSplash ? 'hidden' : 'visible'
          }}
        >
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '16px',
                background: '#1E2F2E',
                color: '#fff',
                padding: '12px 20px',
                fontSize: '14px',
                fontFamily: '"Cairo", sans-serif',
              },
              success: {
                iconTheme: { primary: '#069484', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#5F7A79', secondary: '#fff' },
              },
            }}
          />

          <ScrollToTop />
          <OfflineFallback />
          <InstallAppButton />
          <ActivityTracker />

          <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-transparent"><BookLoader /></div>}>
            <Routes location={location}>
              {/* Public pages with Navbar + Footer */}
              <Route path="/" element={<Layout><LandingPage /></Layout>} />
              <Route path="/marketplace" element={<Layout><MarketplacePage /></Layout>} />
              <Route path="/books/:id" element={<Layout><BookDetailsPage /></Layout>} />
              <Route path="/cart" element={<Layout><CartPage /></Layout>} />
              <Route path="/about" element={<Layout><AboutUsPage /></Layout>} />
              <Route path="/best-sellers" element={<Layout><BestSellersPage /></Layout>} />
              <Route path="/faq" element={<Layout><FaqPage /></Layout>} />
              <Route path="/store" element={<Layout><StorePage /></Layout>} />

              {/* Auth pages (no navbar/footer) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected: Checkout */}
              <Route path="/checkout" element={
                <ProtectedRoute roles={['student']}>
                  <Layout><CheckoutPage /></Layout>
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute roles={['student', 'teacher', 'admin']}>
                  <Layout><ProfilePage /></Layout>
                </ProtectedRoute>
              } />

              {/* Protected: Student Dashboard */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute roles={['student']}>
                  <Layout showFooter={false}><StudentDashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* Protected: Teacher Dashboard */}
              <Route path="/teacher/dashboard" element={
                <ProtectedRoute roles={['teacher']}>
                  <Layout showFooter={false}><TeacherDashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* Protected: Admin Dashboard */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <Layout showFooter={false}><AdminDashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* Invoice Preview */}
              <Route path="/invoice-preview/:id" element={
                <ProtectedRoute roles={['student', 'teacher', 'admin']}>
                  <InvoicePreview />
                </ProtectedRoute>
              } />
              <Route path="/invoice-preview/bulk" element={
                <ProtectedRoute roles={['teacher', 'admin']}>
                  <InvoicePreview />
                </ProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={
                <div className="flex flex-col justify-center items-center bg-transparent min-h-screen">
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="flex justify-center mb-4 text-text-muted text-8xl">
                    <FiSearch />
                  </motion.div>
                  <h1 className="mb-2 font-heading font-bold text-3xl">404</h1>
                  <p className="mb-4 text-text-muted">الصفحة غير موجودة</p>
                  <a href="/" className="font-semibold text-primary hover:underline transition-all">العودة للرئيسية</a>
                </div>
              } />
            </Routes>
          </Suspense>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
