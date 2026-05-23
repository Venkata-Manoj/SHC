import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const emptyForm = {
  name: '', startDate: '', endDate: '', registrationLink: '',
  mode: 'ONLINE', location: '', description: '', prizePool: '',
  themes: '', organizer: '', teamSizeMin: 2, teamSizeMax: 4,
};

export default function CoordinatorPanel() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const editMatch = location.pathname.match(/\/coordinator\/edit\/(.+)/);
  const editId = editMatch?.[1] || null;

  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/hackathons?limit=50').then(res => setEvents(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (editId) {
      setLoading(true);
      api.get(`/hackathons/${editId}`).then(res => {
        const e = res.data.data || res.data;
        setForm({
          name: e.name || '',
          startDate: e.startDate ? e.startDate.slice(0, 10) : '',
          endDate: e.endDate ? e.endDate.slice(0, 10) : '',
          registrationLink: e.registrationLink || '',
          mode: e.mode || 'ONLINE',
          location: e.location || '',
          description: e.description || '',
          prizePool: e.prizePool || '',
          themes: Array.isArray(e.themes) ? e.themes.join(', ') : (e.themes || ''),
          organizer: e.organizer || '',
          teamSizeMin: e.teamSizeMin || 2,
          teamSizeMax: e.teamSizeMax || 4,
        });
        setShowForm(true);
      }).catch(() => {
        navigate('/coordinator');
      }).finally(() => setLoading(false));
    }
  }, [editId]);

  if (!user || !['ADMIN', 'COORDINATOR'].includes(user.role)) return <Navigate to="/login" />;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        themes: form.themes.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (editId) {
        await api.put(`/hackathons/${editId}`, payload);
      } else {
        await api.post('/hackathons', payload);
      }
      toast.success(editId ? 'Hackathon updated!' : 'Hackathon created!');
      setShowForm(false);
      setForm(emptyForm);
      if (editId) {
        navigate('/coordinator');
      }
      const res = await api.get('/hackathons?limit=50');
      setEvents(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || (editId ? 'Failed to update' : 'Failed to create'));
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setForm(emptyForm);
    if (editId) navigate('/coordinator');
  }

  async function handleDelete(id) {
    if (!confirm('Delete this hackathon?')) return;
    try {
      await api.delete(`/hackathons/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Hackathon deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold">{editId ? 'Edit Hackathon' : 'Coordinator Panel'}</h1>
          <p className="text-text-secondary">{editId ? 'Update hackathon details' : 'Manage your hackathon listings'}</p>
        </div>
        {!editId && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background px-6 py-3 font-semibold rounded-xl transition-colors">
            <Plus className="h-5 w-5" /> New Hackathon
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-xl p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="name" placeholder="Hackathon Name *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
            <input name="organizer" placeholder="Organizer" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })}
              className="bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
            <input name="startDate" type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
              className="bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
            <input name="endDate" type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
              className="bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
            <input name="registrationLink" type="url" placeholder="Registration Link *" required value={form.registrationLink} onChange={e => setForm({ ...form, registrationLink: e.target.value })}
              className="bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
            <select name="mode" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}
              className="bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary">
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
              <option value="HYBRID">Hybrid</option>
            </select>
            <input name="location" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              className="bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
            <input name="prizePool" placeholder="Prize Pool (e.g. ₹1,00,000)" value={form.prizePool} onChange={e => setForm({ ...form, prizePool: e.target.value })}
              className="bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
            <input name="themes" placeholder="Themes (comma separated)" value={form.themes} onChange={e => setForm({ ...form, themes: e.target.value })}
              className="bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary" />
          </div>
          <textarea name="description" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full bg-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary min-h-[100px]" />
          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="bg-primary hover:bg-primary-hover text-background px-6 py-3 font-semibold rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : (editId ? 'Update Hackathon' : 'Create Hackathon')}
            </button>
            <button type="button" onClick={handleCancel} className="border border-border px-6 py-3 rounded-xl hover:bg-surface">Cancel</button>
          </div>
        </form>
      )}

      {!editId && (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Date</th>
                <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event._id} className="border-b border-border hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium">{event.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      event.status === 'UPCOMING' ? 'bg-success/20 text-success' :
                      event.status === 'ONGOING' ? 'bg-primary/20 text-primary' : 'bg-text-muted/20 text-text-muted'
                    }`}>{event.status}</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(event.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/events/${event._id}`} className="p-2 hover:bg-elevated rounded-lg"><Eye className="h-4 w-4" /></Link>
                      <Link to={`/coordinator/edit/${event._id}`} className="p-2 hover:bg-elevated rounded-lg"><Pencil className="h-4 w-4" /></Link>
                      {user.role === 'ADMIN' && (
                        <button onClick={() => handleDelete(event._id)} className="p-2 hover:bg-elevated rounded-lg text-error"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
