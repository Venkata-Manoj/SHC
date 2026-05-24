import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import CookieConsent from './components/CookieConsent';
import FeedbackWidget from './components/FeedbackWidget';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';

const Home = lazy(() => import('./pages/Home'));
const EventList = lazy(() => import('./pages/EventList'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Archive = lazy(() => import('./pages/Archive'));
const FeatureRequests = lazy(() => import('./pages/FeatureRequests'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CoordinatorPanel = lazy(() => import('./pages/CoordinatorPanel'));

function LoadingFallback() {
  return <div className="text-center py-20 text-text-secondary">Loading...</div>;
}

function usePageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const titles = {
      '/': 'SIMATS Hackathon Discovery',
      '/events': 'Hackathons — SIMATS Hackathon Discovery',
      '/events/archived': 'Archived Hackathons — SIMATS Hackathon Discovery',
      '/feature-requests': 'Feature Requests — SIMATS Hackathon Discovery',
      '/login': 'Sign In — SIMATS Hackathon Discovery',
      '/register': 'Create Account — SIMATS Hackathon Discovery',
      '/terms': 'Terms of Service — SIMATS Hackathon Discovery',
      '/privacy': 'Privacy Policy — SIMATS Hackathon Discovery',
    };
    document.title = titles[pathname] || 'SIMATS Hackathon Discovery';
  }, [pathname]);
}

export default function App() {
  usePageTitle();

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#141414', color: '#F5EFE0', border: '1px solid #212121' },
        success: { iconTheme: { primary: '#22c55e', secondary: '#141414' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#141414' } },
      }} />
      <Navbar />
      <main>
        <ErrorBoundary>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/events/archived" element={<Archive />} />
              <Route path="/feature-requests" element={<FeatureRequests />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/coordinator/*" element={<CoordinatorPanel />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <CookieConsent />
      <FeedbackWidget />
    </div>
  );
}
