import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'GENERATOR',       label: 'Generator',      icon: '🌾', desc: 'Sell your waste' },
  { value: 'RECYCLING_PLANT', label: 'Plant',           icon: '🏭', desc: 'Buy & process' },
  { value: 'LOGISTICS_AGENT', label: 'Agent',           icon: '🚛', desc: 'Pickup & deliver' },
];

export default function AuthPage() {
  const [tab, setTab]       = useState('login');
  const [role, setRole]     = useState('GENERATOR');
  const [form, setForm]     = useState({ name: '', phone: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const { loginUser }       = useAuth();
  const navigate            = useNavigate();

  const handle   = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const switchTab = (t) => { setTab(t); setError(''); setSuccess(''); setForm({ name: '', phone: '', email: '', password: '' }); };

  const getRoleRoute = (r) =>
    ({ GENERATOR: '/generator', RECYCLING_PLANT: '/plant', LOGISTICS_AGENT: '/agent' }[r] || '/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      if (tab === 'signup') {
        await signup({ ...form, role });
        const ph = form.phone;
        switchTab('login');
        setForm(f => ({ ...f, phone: ph }));
        setSuccess('Account created! Please login with your credentials.');
      } else {
        const res = await login({ phone: form.phone, password: form.password });
        loginUser({ name: res.data.name, role: res.data.role, userId: res.data.userId }, res.data.token);
        navigate(getRoleRoute(res.data.role));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">

        {/* ── Logo ── */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🌿</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: 4 }}>
            EcoConnect
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Sustainable Waste Management Platform
          </p>
        </div>

        {/* ── Tabs ── */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login'  ? 'active' : ''}`} onClick={() => switchTab('login')}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => switchTab('signup')}>
            Create Account
          </button>
        </div>

        {/* ── Alerts ── */}
        {success && <div className="alert alert-success" style={{ marginBottom: 18 }}>✅ {success}</div>}
        {error   && <div className="alert alert-error"   style={{ marginBottom: 18 }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Role Selector (signup only) ── */}
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div className="role-selector">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    className={`role-option ${role === r.value ? 'selected' : ''}`}
                    onClick={() => setRole(r.value)}
                  >
                    <span className="role-icon">{r.icon}</span>
                    <span className="role-label">{r.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.65, marginTop: 2, display: 'block' }}>{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Full Name ── */}
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" name="name" placeholder="Ramesh Patil" value={form.name} onChange={handle} required />
            </div>
          )}

          {/* ── Phone ── */}
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" name="phone" placeholder="9876543210" value={form.phone} onChange={handle} required maxLength={15} />
          </div>

          {/* ── Email (signup only) ── */}
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
              <input className="form-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />
            </div>
          )}

          {/* ── Password ── */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required minLength={6} />
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
            style={{ width: '100%', marginTop: 8 }}>
            {loading
              ? <><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite'}} />Please wait...</>
              : tab === 'login' ? '→ Sign In' : '✨ Create Account'
            }
          </button>
        </form>

        {/* ── Switch link ── */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 22 }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            style={{ background: 'none', border: 'none', color: 'var(--emerald-400)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
            onClick={() => switchTab(tab === 'login' ? 'signup' : 'login')}
          >
            {tab === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {/* ── Footer badges ── */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          {['🤖 AI-Powered', '🔒 Secure', '🌿 Eco-friendly'].map(b => (
            <span key={b} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 99, padding: '3px 10px' }}>
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
