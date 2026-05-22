import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '', college: '', department: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass rounded-2xl p-8">
        <h1 className="font-heading text-2xl font-bold text-center mb-6">Create Account</h1>
        {error && <div className="bg-error/10 text-error px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="Full Name" required value={form.name} onChange={handleChange}
            className="w-full bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary" />
          <input name="email" type="email" placeholder="Email (college email preferred)" required value={form.email} onChange={handleChange}
            className="w-full bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary" />
          <input name="password" type="password" placeholder="Password (min 8 chars)" required minLength={8} value={form.password} onChange={handleChange}
            className="w-full bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary" />
          <input name="college" placeholder="College / Institution" value={form.college} onChange={handleChange}
            className="w-full bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary" />
          <input name="department" placeholder="Department / Major" value={form.department} onChange={handleChange}
            className="w-full bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-background font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-text-secondary text-sm mt-4">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
