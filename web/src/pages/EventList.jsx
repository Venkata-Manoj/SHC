import { useState, useEffect, useCallback, useRef } from 'react';
import EventCard from '../components/EventCard';
import Filters from '../components/Filters';
import CalendarView from '../components/CalendarView';
import SkeletonCard from '../components/SkeletonCard';
import { getBookmarks, toggleBookmark as toggleSharedBookmark } from '../services/bookmarks';
import api from '../services/api';
import { useSearchParams, Link } from 'react-router-dom';
import { Archive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
  const sentinelRef = useRef(null);
  const abortRef = useRef(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const loadEvents = useCallback(async (p = 1, append = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = { page: p, limit: 12, ...filtersRef.current };
      const res = await api.get('/hackathons', { params, signal: controller.signal });
      setEvents(prev => p === 1 ? res.data.data : [...prev, ...res.data.data]);
      setTotalPages(res.data.pagination.totalPages);
      setPage(p);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        toast.error('Failed to load events');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { loadEvents(1); return () => abortRef.current?.abort(); }, [loadEvents]);

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.mode) params.mode = filters.mode;
    if (filters.status) params.status = filters.status;
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && page < totalPages && !loadingMore) {
        loadEvents(page + 1, true);
      }
    }, { rootMargin: '200px' });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, loadingMore, loadEvents]);

  const toggleBookmark = (id) => {
    const updated = toggleSharedBookmark(id);
    setBookmarks(updated);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-3xl font-bold">Hackathons</h1>
        <Link to="/events/archived" className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary underline decoration-transparent hover:decoration-current">
          <Archive className="h-4 w-4" /> Archived
        </Link>
      </div>
      <div className="flex flex-col gap-6">
        <Filters filters={filters} onChange={setFilters} view={view} onViewChange={setView} />

        {view === 'calendar' ? (
          <CalendarView events={events} />
        ) : (
          <>
            {filters.search && events.length > 0 && (
              <div className="text-xs text-text-muted mb-2">Sorted by relevance</div>
            )}
            <div className={view === 'grid'
              ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-4'
            }>
              {loading && events.length === 0 ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                events.map(event => (
                  <EventCard
                    key={event._id}
                    event={event}
                    view={view}
                    isBookmarked={bookmarks.includes(event._id)}
                    onToggleBookmark={() => toggleBookmark(event._id)}
                  />
                ))
              )}
            </div>
            {events.length === 0 && !loading && (
              <div className="text-center py-20 text-text-secondary">
                <p className="text-xl">No hackathons found matching your criteria</p>
                <p className="mt-2">Try adjusting your search or filters</p>
              </div>
            )}
            {loadingMore && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}
            <div ref={sentinelRef} className="h-4" />
          </>
        )}
      </div>
    </div>
  );
}
