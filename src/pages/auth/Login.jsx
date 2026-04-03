import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { MdEmail, MdLock } from 'react-icons/md';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      switch (user.role) {
        case 'citizen': navigate('/citizen/dashboard'); break;
        case 'officer': navigate('/officer/dashboard'); break;
        case 'authority': navigate('/authority/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const quickLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Logged in as ${user.role}`);
      switch (user.role) {
        case 'citizen': navigate('/citizen/dashboard'); break;
        case 'officer': navigate('/officer/dashboard'); break;
        case 'authority': navigate('/authority/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
      }
    } catch { toast.error('Quick login failed'); } 
    finally { setLoading(false); }
  };

  const demoAccounts = [
    { label: 'Admin', email: 'admin@jantantra.gov.in', pass: 'Admin@123', color: '#dc2626' },
    { label: 'Authority', email: 'authority@jantantra.gov.in', pass: 'Auth@123', color: '#7c3aed' },
    { label: 'Officer', email: 'officer1@jantantra.gov.in', pass: 'Officer@123', color: '#16a34a' },
    { label: 'Citizen', email: 'citizen1@gmail.com', pass: 'Citizen@123', color: '#2563eb' },
  ];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand">Jan<span>Tantra</span></div>
          <div className="tagline">🇮🇳 Digital Governance Platform</div>
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Login to access your governance portal</p>

        {/* Quick Login Demo */}
        <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Quick Demo Login</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {demoAccounts.map(d => (
              <button key={d.label} onClick={() => quickLogin(d.email, d.pass)}
                style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: d.color, color: '#fff', border: 'none', cursor: 'pointer' }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" placeholder="your@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}>
            {loading ? 'Logging in...' : 'Login to Portal'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
        <div className="auth-switch mt-8">
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 13 }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
