import { Link } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const links = [
    { to: '/events', label: 'Events' },
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin' }] : []),
    ...(user?.role === 'COORDINATOR' || user?.role === 'ADMIN' ? [{ to: '/coordinator', label: 'Coordinator' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="font-heading text-xl font-bold">
            <span className="text-primary">SIMATS</span> Hackathon
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.to} to={l.to} className="text-text-secondary hover:text-text-primary transition-colors">{l.label}</Link>
            ))}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
                  <User className="h-4 w-4" /> {user.name}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-text-secondary hover:text-error transition-colors">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
                <Link to="/register" className="bg-primary hover:bg-primary-hover text-background px-4 py-2 rounded-xl font-semibold text-sm transition-colors">Sign Up</Link>
              </div>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-4 py-4 space-y-3 bg-surface">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-text-secondary hover:text-text-primary">{l.label}</Link>
          ))}
          {user ? (
            <>
              <div className="text-text-secondary"><User className="h-4 w-4 inline mr-2" />{user.name}</div>
              <button onClick={handleLogout} className="block text-error">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block text-text-secondary">Sign In</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block bg-primary text-background px-4 py-2 rounded-xl text-center font-semibold">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
