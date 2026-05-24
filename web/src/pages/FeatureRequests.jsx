import { useState, useEffect } from 'react';
import { ArrowUp, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function FeatureRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState({});

  useEffect(() => {
    api.get('/feedback', { params: { type: 'FEATURE_REQUEST', limit: 50 } })
      .then(res => setRequests([...res.data.data].sort((a, b) => b.votes - a.votes)))
      .catch(() => toast.error('Failed to load feature requests'))
      .finally(() => setLoading(false));
  }, []);

  async function handleVote(id) {
    if (voting[id]) return;
    setVoting(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/feedback/${id}/vote`);
      setRequests(prev => prev.map(r =>
        r._id === id ? { ...r, votes: r.votes + 1 } : r
      ).sort((a, b) => b.votes - a.votes));
    } catch {
      toast.error('Vote failed');
    } finally {
      setVoting(prev => ({ ...prev, [id]: false }));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-2">
        <Lightbulb className="h-8 w-8 text-primary" />
        <h1 className="font-heading text-3xl font-bold">Feature Requests</h1>
      </div>
      <p className="text-text-secondary mb-8">Vote on feature suggestions or submit your own via the feedback widget</p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-elevated rounded w-3/4 mb-2" />
              <div className="h-3 bg-elevated rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-text-secondary">No feature requests yet</p>
          <p className="text-sm text-text-muted mt-1">Be the first to suggest one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r._id} className="glass rounded-xl p-4 flex items-start gap-4">
              <button
                onClick={() => handleVote(r._id)}
                disabled={voting[r._id]}
                className="flex flex-col items-center gap-0.5 min-w-[48px] p-2 rounded-lg hover:bg-elevated transition-colors disabled:opacity-50"
                aria-label={`Vote for ${r.name}`}
              >
                <ArrowUp className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm">{r.votes}</span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{r.name}</div>
                {r.message && <div className="text-sm text-text-secondary mt-1">{r.message}</div>}
                <div className="text-xs text-text-muted mt-2">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
