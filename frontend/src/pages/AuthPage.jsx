import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const [tab, setTab]           = useState('login');   // 'login' | 'register'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const { login, register, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  /* Already signed in → go to input page */
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  /* Clear errors when switching tabs */
  const switchTab = (t) => {
    setTab(t);
    setFormError('');
    clearError();
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) { setFormError('Email and password are required.'); return; }
    if (tab === 'register' && !name) { setFormError('Name is required.'); return; }
    if (password.length < 6) { setFormError('Password must be at least 6 characters.'); return; }

    const result = tab === 'login'
      ? await login(email, password)
      : await register(name, email, password);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setFormError(result.message || 'Something went wrong.');
    }
  };

  const displayError = formError || error;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: 20 }}>
      <AnimatedBackground theme="login" />
      <motion.div
        className="auth-card"
        style={{ position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <span className="auth-brand-dot" />
          <span className="auth-brand-name">IntentOS</span>
        </div>
        <p className="auth-tagline">AI-Powered Intent Driven Workspace</p>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === 'login' ? ' auth-tab--active' : ''}`}
            onClick={() => switchTab('login')}
            type="button"
          >
            Sign In
          </button>
          <button
            className={`auth-tab${tab === 'register' ? ' auth-tab--active' : ''}`}
            onClick={() => switchTab('register')}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {tab === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                id="auth-name"
                className="auth-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              id="auth-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              id="auth-password"
              className="auth-input"
              type="password"
              placeholder={tab === 'register' ? 'Min. 6 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {/* Error message */}
          {displayError && (
            <div className="auth-error">
              <span>⚠️</span> {displayError}
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
              : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="auth-switch">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="auth-switch-link"
            type="button"
            onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
          >
            {tab === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
