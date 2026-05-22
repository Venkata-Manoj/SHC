import { useState, useEffect, useCallback } from 'react';
import EventCard from '../components/EventCard';
import Filters from '../components/Filters';
import CalendarView from '../components/CalendarView';
import { getBookmarks } from '../services/bookmarks';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';

export default function EventList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    mode: searchParams.get('mode') || '',
    status: searchParams.get('status') || '',
    theme: searchParams.get('theme') || '',
    sort: '-startDate',
  });
  const [bookmarks, setBookmarks] = useState(getBookmarks());

  const loadEvents = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12, ...filters };
      if (params.search) params.search = params.search;
      const res = await api.get('/hackathons', { params });
      setEvents(prev => p === 1 ? res.data.data : [...prev, ...res.data.data]);
      setTotalPages(res.data.pagination.totalPages);
      setPage(p);
    } catch { /* cached fallback handled by SW */ } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadEvents(1); }, [loadEvents]);

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.mode) params.mode = filters.mode;
    if (filters.status) params.status = filters.status;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const toggleBookmark = (id) => {
    const idx = bookmarks.indexOf(id);
    const updated = idx >= 0 ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
    setBookmarks(updated);
    localStorage.setItem('shc-bookmarks', JSON.stringify(updated));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <Filters filters={filters} onChange={setFilters} view={view} onViewChange={setView} />
        
        {view === 'calendar' ? (
          <CalendarView events={events} />
        ) : (
          <>
            <div className={view === 'grid'
              ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-4'
            }>
              {events.map(event => (
                <EventCard
                  key={event._id}
                  event={event}
                  view={view}
                  isBookmarked={bookmarks.includes(event._id)}
                  onToggleBookmark={() => toggleBookmark(event._id)}
                />
              ))}
            </div>
            {events.length === 0 && !loading && (
              <div className="text-center py-20 text-text-secondary">
                <p className="text-xl">No hackathons found matching your criteria</p>
                <p className="mt-2">Try adjusting your search or filters</p>
              </div>
            )}
            {page < totalPages && (
              <div className="text-center mt-8">
                <button onClick={() => loadEvents(page + 1)} className="bg-primary hover:bg-primary-hover text-background px-8 py-3 font-semibold rounded-xl transition-colors">
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
