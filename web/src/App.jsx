import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import CookieConsent from './components/CookieConsent';
import FeedbackWidget from './components/FeedbackWidget';
import Home from './pages/Home';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CoordinatorPanel from './pages/CoordinatorPanel';
import Archive from './pages/Archive';
import FeatureRequests from './pages/FeatureRequests';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

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
      </main>
      <CookieConsent />
      <FeedbackWidget />
    </div>
  );
}
