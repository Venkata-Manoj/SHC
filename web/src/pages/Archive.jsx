import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { getBookmarks, toggleBookmark as toggleSharedBookmark } from '../services/bookmarks';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Archive() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState(getBookmarks());

  useEffect(() => {
    api.get('/hackathons', { params: { archived: true, limit: 50 } }).then(res => {
      setEvents(res.data.data);
    }).catch(() => toast.error('Failed to load archived events')).finally(() => setLoading(false));
  }, []);

  const toggleBookmark = (id) => {
    const updated = toggleSharedBookmark(id);
    setBookmarks(updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold mb-2">Archived Hackathons</h1>
      <p className="text-text-secondary mb-8">Past hackathons that have ended and been archived</p>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden animate-pulse">
              <div className="h-40 bg-elevated" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-elevated rounded w-3/4" />
                <div className="h-3 bg-elevated rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-text-secondary">
          <p className="text-xl">No archived hackathons</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map(event => (
            <EventCard
              key={event._id}
              event={event}
              isBookmarked={bookmarks.includes(event._id)}
              onToggleBookmark={() => toggleBookmark(event._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
