import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CalendarView({ events }) {
  const navigate = useNavigate();
  const now = new Date();

  const calendarEvents = useMemo(() => events.map(e => ({
    id: e._id,
    title: e.name,
    start: new Date(e.startDate),
    end: new Date(e.endDate),
    status: e.status,
  })), [events]);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(now);
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getEventsForDay(day) {
    const date = new Date(now.getFullYear(), now.getMonth(), day);
    return calendarEvents.filter(e => {
      const s = new Date(e.start);
      const end = new Date(e.end);
      return date >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) &&
             date <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-heading text-lg font-semibold">{monthName}</h3>
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
          const isToday = day === now.getDate();
          return (
            <div key={day} className={`min-h-[100px] border-r border-b border-border p-1.5 ${isToday ? 'bg-primary/5' : ''}`}>
              <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-primary' : 'text-text-secondary'}`}>{day}</div>
              {dayEvents.slice(0, 3).map(e => (
                <button key={e.id} onClick={() => navigate(`/events/${e.id}`)}
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
