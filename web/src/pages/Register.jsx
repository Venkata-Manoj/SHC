import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const emailRegex = /^\S+@\S+\.\S+$/;
const passwordMin = 8;
const nameMax = 100;

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '', college: '', department: '' });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.length > nameMax) errs.name = `Name must be ${nameMax} characters or less`;
    if (!emailRegex.test(form.email)) errs.email = 'Please enter a valid email address';
    if (form.password.length < passwordMin) errs.password = `Password must be at least ${passwordMin} characters`;
    if (form.password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data);
      navigate('/events');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass rounded-2xl p-8">
        <h1 className="font-heading text-2xl font-bold text-center mb-6">Create Account</h1>
        {serverError && <div className="bg-error/10 text-error px-4 py-2 rounded-lg mb-4 text-sm">{serverError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reg-name" className="block text-sm text-text-secondary mb-1">Full Name *</label>
            <input id="reg-name" name="name" placeholder="Full Name" required value={form.name} onChange={handleChange}
              className={`w-full bg-elevated border ${errors.name ? 'border-error' : 'border-border'} rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary`} />
            {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm text-text-secondary mb-1">Email *</label>
            <input id="reg-email" name="email" type="email" placeholder="Email (college email preferred)" required value={form.email} onChange={handleChange}
              className={`w-full bg-elevated border ${errors.email ? 'border-error' : 'border-border'} rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary`} />
            {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm text-text-secondary mb-1">Password *</label>
            <input id="reg-password" name="password" type="password" placeholder="Password (min 8 chars)" required minLength={passwordMin} value={form.password} onChange={handleChange}
              className={`w-full bg-elevated border ${errors.password ? 'border-error' : 'border-border'} rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary`} />
            {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="reg-confirm-password" className="block text-sm text-text-secondary mb-1">Confirm Password *</label>
            <input id="reg-confirm-password" name="confirmPassword" type="password" placeholder="Confirm password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full bg-elevated border ${errors.confirmPassword ? 'border-error' : 'border-border'} rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary`} />
            {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          <div>
            <label htmlFor="reg-college" className="block text-sm text-text-secondary mb-1">College / Institution</label>
            <input id="reg-college" name="college" placeholder="College / Institution" value={form.college} onChange={handleChange}
              className="w-full bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label htmlFor="reg-dept" className="block text-sm text-text-secondary mb-1">Department / Major</label>
            <input id="reg-dept" name="department" placeholder="Department / Major" value={form.department} onChange={handleChange}
              className="w-full bg-elevated border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-primary" />
          </div>
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
