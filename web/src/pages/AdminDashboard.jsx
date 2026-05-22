import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    api.get('/analytics').then(res => setAnalytics(res.data)).catch(() => {});
    api.get('/submissions?status=PENDING').then(res => setSubmissions(res.data.data)).catch(() => {});
  }, []);

  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-text-secondary mb-8">Manage hackathons, submissions, and view analytics</p>

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
          </div>
        </div>
      </div>

      {submissions.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h2 className="font-heading text-xl font-semibold mb-4">Pending Submissions</h2>
          <div className="space-y-3">
            {submissions.map(s => (
              <div key={s._id} className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <div className="font-semibold">{s.hackathonData?.name}</div>
                  <div className="text-sm text-text-secondary">by {s.submitterEmail}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-success/20 text-success px-3 py-1 rounded-lg hover:bg-success/30">Approve</button>
                  <button className="text-xs bg-error/20 text-error px-3 py-1 rounded-lg hover:bg-error/30">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
