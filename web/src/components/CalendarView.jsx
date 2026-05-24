import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function normalizeDate(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export default function CalendarView({ events }) {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(() => new Date());

  const calendarEvents = useMemo(() => events.map(e => ({
    id: e._id,
    title: e.name,
    startMs: normalizeDate(e.startDate),
    endMs: normalizeDate(e.endDate),
    status: e.status,
  })), [events]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = useMemo(() => `${viewDate.toLocaleString('default', { month: 'long' })} ${year}`, [viewDate]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
  const weekDays = useMemo(() => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], []);

  const getEventsForDay = useCallback((day) => {
    const dateMs = new Date(year, month, day).getTime();
    return calendarEvents.filter(e => dateMs >= e.startMs && dateMs <= e.endMs);
  }, [calendarEvents, year, month]);

  const prevMonth = useCallback(() => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    setViewDate(new Date());
  }, []);

  function onNavKeyDown(e, action) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold">{monthName}</h3>
        <div className="flex items-center gap-1">
          <button onClick={goToToday} onKeyDown={e => onNavKeyDown(e, goToToday)}
            tabIndex={0} aria-label="Go to today"
            className="text-xs border border-border px-2 py-1 rounded hover:bg-surface mr-2">
            Today
          </button>
          <button onClick={prevMonth} onKeyDown={e => onNavKeyDown(e, prevMonth)}
            tabIndex={0} aria-label="Previous month"
            className="p-1 hover:bg-surface rounded">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={nextMonth} onKeyDown={e => onNavKeyDown(e, nextMonth)}
            tabIndex={0} aria-label="Next month"
            className="p-1 hover:bg-surface rounded">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map(d => (
          <div key={d} className="px-2 py-2 text-xs font-semibold text-text-secondary text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-border bg-surface/30" />
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const today = new Date();
          const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
          return (
            <div key={day} className={`min-h-[100px] border-r border-b border-border p-1.5 ${isToday ? 'bg-primary/5' : ''}`}>
              <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-primary' : 'text-text-secondary'}`}>{day}</div>
              {dayEvents.slice(0, 3).map(e => (
                <button key={e.id} onClick={() => navigate(`/events/${e.id}`)}
                  tabIndex={0}
                  onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); navigate(`/events/${e.id}`); } }}
                  className={`block w-full text-left text-xs px-1.5 py-0.5 rounded mb-0.5 truncate ${
                    e.status === 'UPCOMING' ? 'bg-success/20 text-success' :
                    e.status === 'ONGOING' ? 'bg-primary/20 text-primary' : 'bg-text-muted/20 text-text-muted'
                  }`}>
                  {e.title}
                </button>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-text-muted px-1">+{dayEvents.length - 3} more</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
