import { Link } from 'react-router-dom';
import { Calendar, MapPin, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';

export default function EventCard({ event, view, isBookmarked, onToggleBookmark }) {
  if (view === 'list') {
    return (
      <div className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all">
        <div className="flex-1 min-w-0">
          <Link to={`/events/${event._id}`} className="font-heading font-semibold hover:text-primary transition-colors truncate block">{event.name}</Link>
          <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(event.startDate).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location || 'Virtual'}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              event.status === 'UPCOMING' ? 'bg-success/20 text-success' :
              event.status === 'ONGOING' ? 'bg-primary/20 text-primary' : 'bg-text-muted/20 text-text-muted'
            }`}>{event.status}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleBookmark} className="p-2 hover:bg-elevated rounded-lg">
            {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
          </button>
          <Link to={`/events/${event._id}`} className="p-2 hover:bg-elevated rounded-lg"><ExternalLink className="h-4 w-4" /></Link>
        </div>
      </div>
    );
  }

  const initial = event.name?.charAt(0)?.toUpperCase() || 'H';

  return (
    <div className="glass rounded-xl overflow-hidden hover:border-primary/50 transition-all group">
      <Link to={`/events/${event._id}`}>
        <div className="h-40 bg-gradient-to-br from-elevated to-surface flex items-center justify-center">
          {event.coverImage ? (
            <img src={event.coverImage} alt={event.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-heading text-6xl font-bold text-primary/30">{initial}</span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link to={`/events/${event._id}`}>
            <h3 className="font-heading font-semibold hover:text-primary transition-colors line-clamp-2">{event.name}</h3>
          </Link>
          <button onClick={onToggleBookmark} className="p-1.5 hover:bg-elevated rounded-lg shrink-0">
            {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4 text-text-secondary" />}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-text-secondary">
          <span className={`px-2 py-0.5 rounded font-semibold ${
            event.mode === 'ONLINE' ? 'bg-primary/10 text-primary' :
            event.mode === 'HYBRID' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
          }`}>{event.mode}</span>
          <span className={`px-2 py-0.5 rounded font-semibold ${
            event.status === 'UPCOMING' ? 'bg-success/20 text-success' :
            event.status === 'ONGOING' ? 'bg-primary/20 text-primary' : 'bg-text-muted/20 text-text-muted'
          }`}>{event.status}</span>
        </div>
        <div className="mt-3 space-y-1 text-sm text-text-secondary">
          <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</div>
          <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location || 'Virtual'}</div>
        </div>
        {event.prizePool && <div className="mt-2 font-semibold text-sm text-primary">{event.prizePool}</div>}
      </div>
    </div>
  );
}
