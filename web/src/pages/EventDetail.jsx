import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Globe, Users, DollarSign, ExternalLink, Share2, ChevronLeft, AlertTriangle, Map } from 'lucide-react';
import ShareButtons from '../components/ShareButtons';
import { useAuth } from '../context/AuthContext';
import SkeletonCard from '../components/SkeletonCard';
import api from '../services/api';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/hackathons/${id}`)
      .then(res => setEvent(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  if (error) return <div className="text-center py-20 text-error">{error}</div>;
  if (loading) return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-6 bg-elevated rounded w-24 mb-8 animate-pulse" />
      <div className="h-64 sm:h-96 bg-elevated rounded-xl mb-8 animate-pulse" />
      <div className="space-y-3">
        <div className="h-8 bg-elevated rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-elevated rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );
  if (!event) return <div className="text-center py-20 text-text-secondary">Hackathon not found</div>;

  const regDisabled = event.isRegistrationLinkBroken && !event.registrationLinkOverride;

  const handleRegisterClick = () => {
    if (!regDisabled) {
      api.post(`/analytics/${id}/click`).catch(() => {});
      window.open(event.registrationLink, '_blank', 'noopener');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to events
      </Link>

      {event.coverImage && (
        <img src={event.coverImage} alt={event.name} className="w-full h-64 sm:h-96 object-cover rounded-xl mb-8" />
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex gap-2 mb-2">
            <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/20 text-primary uppercase">{event.mode}</span>
            <span className={`text-xs font-semibold px-2 py-1 rounded uppercase ${
              event.status === 'UPCOMING' ? 'bg-success/20 text-success' :
              event.status === 'ONGOING' ? 'bg-primary/20 text-primary' :
              'bg-text-muted/20 text-text-muted'
            }`}>{event.status}</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold">{event.name}</h1>
          {event.organizer && <p className="text-text-secondary mt-1">by {event.organizer}</p>}
        </div>
        <ShareButtons event={event} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Info icon={Calendar} label="Start" value={new Date(event.startDate).toLocaleDateString()} />
        <Info icon={Clock} label="End" value={new Date(event.endDate).toLocaleDateString()} />
        <Info icon={MapPin} label="Location" value={event.location || 'Virtual'} />
        {event.prizePool && <Info icon={DollarSign} label="Prize Pool" value={event.prizePool} />}
        {event.themes?.length > 0 && (
          <div className="col-span-full flex gap-2 flex-wrap">
            {event.themes.map(t => <span key={t} className="text-xs px-3 py-1 rounded-full bg-elevated text-text-secondary border border-border">{t}</span>)}
          </div>
        )}
      </div>

      {event.description && (
        <div className="mb-8">
          <h2 className="font-heading text-xl font-semibold mb-3">About</h2>
          <p className="text-text-secondary leading-relaxed">{event.description}</p>
        </div>
      )}

      {event.sponsors?.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-xl font-semibold mb-3">Sponsors</h2>
          <div className="flex gap-4 flex-wrap">{event.sponsors.map(s => (
            <span key={s.name} className="glass px-4 py-2 rounded-lg">{s.name}</span>
          ))}</div>
        </div>
      )}

      {event.schedule?.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-xl font-semibold mb-3">Schedule</h2>
          <div className="space-y-3">{event.schedule.map((s, i) => (
            <div key={i} className="glass rounded-lg p-4">
              <div className="font-semibold">{s.phase}</div>
              {s.date && <div className="text-text-secondary text-sm">{new Date(s.date).toLocaleString()}</div>}
              {s.description && <div className="text-text-secondary mt-1">{s.description}</div>}
            </div>
          ))}</div>
        </div>
      )}

      {event.embeddedMapUrl && (
        <div className="mb-8">
          <h2 className="font-heading text-xl font-semibold mb-3 flex items-center gap-2"><Map className="h-5 w-5" /> Location</h2>
          <div className="glass rounded-xl overflow-hidden">
            <iframe
              src={event.embeddedMapUrl}
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Event location map"
            />
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-8">
        {regDisabled ? (
          <div className="flex items-center gap-2 bg-error/10 text-error px-6 py-3 rounded-xl">
            <AlertTriangle className="h-5 w-5" /> Registration Closed / Link Unavailable
          </div>
        ) : (
          <button onClick={handleRegisterClick} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background px-8 py-4 font-semibold rounded-xl transition-colors">
            Register Now <ExternalLink className="h-5 w-5" />
          </button>
        )}
        {(user?.role === 'ADMIN' || user?.role === 'COORDINATOR') && (
          <Link to={`/coordinator/edit/${event._id}`} className="border border-border text-text-primary hover:bg-surface px-8 py-4 font-semibold rounded-xl transition-colors">
            Edit
          </Link>
        )}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
