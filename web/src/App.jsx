import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import CookieConsent from './components/CookieConsent';
import FeedbackWidget from './components/FeedbackWidget';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Archive from './pages/Archive';
import FeatureRequests from './pages/FeatureRequests';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CoordinatorPanel = lazy(() => import('./pages/CoordinatorPanel'));

function LoadingFallback() {
  return <div className="text-center py-20 text-text-secondary">Loading...</div>;
}

export default function App() {
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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/archived" element={<Archive />} />
            <Route path="/feature-requests" element={<FeatureRequests />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/*" element={<Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>} />
            <Route path="/coordinator/*" element={<Suspense fallback={<LoadingFallback />}><CoordinatorPanel /></Suspense>} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <CookieConsent />
      <FeedbackWidget />
    </div>
  );
}
