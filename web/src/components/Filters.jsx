import { Search, LayoutGrid, List, Calendar } from 'lucide-react';

const MODES = ['', 'ONLINE', 'OFFLINE', 'HYBRID'];
const STATUSES = ['', 'UPCOMING', 'ONGOING', 'ENDED'];
const THEMES = ['', 'AI', 'Web3', 'IoT', 'Healthcare', 'Blockchain', 'Gaming', 'Data Science', 'Entrepreneurship'];
const SORTS = [
  { value: '-startDate', label: 'Date (Newest)' },
  { value: 'startDate', label: 'Date (Oldest)' },
  { value: '-createdAt', label: 'Recently Added' },
  { value: '-prizePool', label: 'Prize Pool' },
];

export default function Filters({ filters, onChange, view, onViewChange }) {
  function update(key, value) {
    onChange(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="glass rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
            type="search" placeholder="Search hackathons..." aria-label="Search hackathons"
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            className="w-full bg-elevated border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-1 bg-elevated rounded-lg p-1">
          {[
            { key: 'grid', icon: LayoutGrid },
            { key: 'list', icon: List },
            { key: 'calendar', icon: Calendar },
          ].map(v => (
            <button key={v.key} onClick={() => onViewChange(v.key)}
              className={`p-2 rounded-md transition-colors ${view === v.key ? 'bg-surface text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              aria-pressed={view === v.key} aria-label={`${v.key} view`}>
              <v.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filters.mode} onChange={e => update('mode', e.target.value)} aria-label="Filter by mode"
          className="bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
          <option value="">All Modes</option>
          {MODES.filter(Boolean).map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filters.status} onChange={e => update('status', e.target.value)} aria-label="Filter by status"
          className="bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.theme} onChange={e => update('theme', e.target.value)} aria-label="Filter by theme"
          className="bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
          <option value="">All Themes</option>
          {THEMES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.sort} onChange={e => update('sort', e.target.value)} aria-label="Sort by"
          className="bg-elevated border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
    </div>
  );
}
