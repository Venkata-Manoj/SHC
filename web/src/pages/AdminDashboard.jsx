import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link, Routes, Route, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Check, X, Trash2, RotateCcw, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

function OverviewTab() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    api.get('/analytics').then(res => setAnalytics(res.data)).catch(() => {});
    api.get('/submissions?status=PENDING').then(res => setSubmissions(res.data.data)).catch(() => {});
  }, []);

  return (
    <>
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Hackathons" value={analytics.totals.hackathons} />
          <StatCard label="Total Views" value={analytics.totals.views} />
          <StatCard label="Total Clicks" value={analytics.totals.clicks} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass rounded-xl p-6">
          <h2 className="font-heading text-xl font-semibold mb-4">Analytics Overview</h2>
          {analytics?.trends && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#212121" />
                <XAxis dataKey="_id.day" stroke="#6B6B6B" />
                <YAxis stroke="#6B6B6B" />
                <Tooltip />
                <Bar dataKey="count" fill="#FF5500" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="font-heading text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/coordinator" className="block glass rounded-lg px-4 py-3 hover:border-primary/50 transition-colors">
              Manage Events
            </Link>
            <Link to="/admin/submissions" className="block glass rounded-lg px-4 py-3 hover:border-primary/50 transition-colors">
              Pending Submissions {submissions.length > 0 && <span className="bg-primary text-background text-xs px-2 py-0.5 rounded-full ml-2">{submissions.length}</span>}
            </Link>
            <Link to="/admin/analytics" className="block glass rounded-lg px-4 py-3 hover:border-primary/50 transition-colors">
              Detailed Analytics & Export
            </Link>
            <Link to="/admin/recycle-bin" className="block glass rounded-lg px-4 py-3 hover:border-primary/50 transition-colors">
              Recycle Bin
            </Link>
          </div>
        </div>
      </div>

      {submissions.length > 0 && (
        <SubmissionsList submissions={submissions} setSubmissions={setSubmissions} showPoster />
      )}
    </>
  );
}

function SubmissionsList({ submissions, setSubmissions, detailed, showPoster }) {
  const [loading, setLoading] = useState({});
  const [posterPreview, setPosterPreview] = useState(null);

  async function handleReview(id, status) {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/submissions/${id}/review`, { status });
      setSubmissions(prev => prev.filter(s => s._id !== id));
      toast.success(`Submission ${status.toLowerCase()}`);
    } catch (err) {
      toast.error('Review failed');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  }

  if (!submissions.length) {
    return (
      <div className="glass rounded-xl p-6 text-center">
        <p className="text-text-secondary">No pending submissions</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      {posterPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPosterPreview(null)}>
          <img src={posterPreview} alt="Poster preview" className="max-h-full max-w-full rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
      <h2 className="font-heading text-xl font-semibold mb-4">Pending Submissions</h2>
      <div className="space-y-3">
        {submissions.map(s => (
          <div key={s._id} className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-3">
              {showPoster && s.posterUrl && (
                <button onClick={() => setPosterPreview(s.posterUrl)} className="shrink-0">
                  <img src={s.posterUrl} alt="" className="h-12 w-12 rounded-lg object-cover border border-border" />
                </button>
              )}
              <div>
                <div className="font-semibold">{s.hackathonData?.name}</div>
                <div className="text-sm text-text-secondary">by {s.submitterEmail}</div>
                {detailed && s.hackathonData?.description && (
                  <div className="text-xs text-text-muted mt-1 line-clamp-2">{s.hackathonData.description}</div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReview(s._id, 'APPROVED')}
                disabled={loading[s._id]}
                className="flex items-center gap-1 text-xs bg-success/20 text-success px-3 py-1 rounded-lg hover:bg-success/30 disabled:opacity-50"
              >
                <Check className="h-3 w-3" /> Approve
              </button>
              <button
                onClick={() => handleReview(s._id, 'REJECTED')}
                disabled={loading[s._id]}
                className="flex items-center gap-1 text-xs bg-error/20 text-error px-3 py-1 rounded-lg hover:bg-error/30 disabled:opacity-50"
              >
                <X className="h-3 w-3" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubmissionsTab() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    api.get('/submissions?status=PENDING').then(res => setSubmissions(res.data.data)).catch(() => {});
  }, []);

  return (
    <>
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h2 className="font-heading text-2xl font-bold mb-4">Pending Submissions</h2>
      <SubmissionsList submissions={submissions} setSubmissions={setSubmissions} detailed showPoster />
    </>
  );
}

function RecycleBinTab() {
  const [deleted, setDeleted] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDeleted() {
    setLoading(true);
    try {
      const res = await api.get('/hackathons/deleted');
      setDeleted(res.data.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDeleted(); }, []);

  async function handleRestore(id) {
    try {
      await api.patch(`/hackathons/${id}/restore`);
      setDeleted(prev => prev.filter(h => h._id !== id));
      toast.success('Hackathon restored');
    } catch (err) {
      toast.error('Restore failed');
    }
  }

  async function handlePermanentDelete(id) {
    if (!confirm('Permanently delete this hackathon? This cannot be undone.')) return;
    try {
      await api.delete(`/hackathons/${id}/permanent`);
      setDeleted(prev => prev.filter(h => h._id !== id));
      toast.success('Hackathon permanently deleted');
    } catch (err) {
      toast.error('Permanent delete failed');
    }
  }

  return (
    <>
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h2 className="font-heading text-2xl font-bold mb-4">Recycle Bin</h2>
      {loading ? (
        <div className="text-center py-20 text-text-secondary">Loading...</div>
      ) : deleted.length === 0 ? (
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-text-secondary">No deleted hackathons</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-text-secondary text-sm font-medium">Deleted At</th>
                <th className="text-right px-4 py-3 text-text-secondary text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deleted.map(h => (
                <tr key={h._id} className="border-b border-border hover:bg-surface/50">
                  <td className="px-4 py-3 font-medium">{h.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{new Date(h.deletedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleRestore(h._id)} className="flex items-center gap-1 text-xs bg-success/20 text-success px-3 py-1 rounded-lg hover:bg-success/30">
                        <RotateCcw className="h-3 w-3" /> Restore
                      </button>
                      <button onClick={() => handlePermanentDelete(h._id)} className="flex items-center gap-1 text-xs bg-error/20 text-error px-3 py-1 rounded-lg hover:bg-error/30">
                        <Trash2 className="h-3 w-3" /> Delete Forever
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/analytics').then(res => setAnalytics(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
      <h2 className="font-heading text-2xl font-bold mb-4">Detailed Analytics</h2>

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Hackathons" value={analytics.totals?.hackathons} />
          <StatCard label="Total Views" value={analytics.totals?.views} />
          <StatCard label="Total Clicks" value={analytics.totals?.clicks} />
        </div>
      )}

      {analytics?.trends && (
        <div className="glass rounded-xl p-6">
          <h3 className="font-heading text-lg font-semibold mb-4">View Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#212121" />
              <XAxis dataKey="_id.day" stroke="#6B6B6B" />
              <YAxis stroke="#6B6B6B" />
              <Tooltip />
              <Bar dataKey="count" fill="#FF5500" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4">
        <a href={`${api.defaults.baseURL}/analytics/export`} className="inline-block bg-primary hover:bg-primary-hover text-background px-6 py-3 font-semibold rounded-xl transition-colors">
          Export CSV
        </a>
      </div>
    </>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-text-secondary mb-8">Manage hackathons, submissions, and view analytics</p>

      <Routes>
        <Route index element={<OverviewTab />} />
        <Route path="submissions" element={<SubmissionsTab />} />
        <Route path="analytics" element={<AnalyticsTab />} />
        <Route path="recycle-bin" element={<RecycleBinTab />} />
      </Routes>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <div className="font-heading text-3xl font-bold text-primary">{value}</div>
      <div className="text-text-secondary text-sm mt-1">{label}</div>
    </div>
  );
}
