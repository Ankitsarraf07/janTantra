import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { areaAPI } from '../../api';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', role: 'citizen', areaId: '', phone: '',
    designation: '', employeeId: ''
  });

  useEffect(() => { areaAPI.getAll().then(r => setAreas(r.data.areas)).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (Number(form.age) < 18) return toast.error('You must be at least 18 years old');
    if (!form.areaId && form.role !== 'admin') return toast.error('Please select your area');

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password, age: Number(form.age), role: form.role, areaId: form.areaId, phone: form.phone, designation: form.designation, employeeId: form.employeeId };
      const user = await register(payload);
      if (!user.isApproved && user.role !== 'citizen') {
        toast.success('Registration successful! Your account is pending admin approval.', { duration: 5000 });
        navigate('/login');
      } else {
        toast.success(`Welcome to JanTantra, ${user.name}!`);
        switch (user.role) {
          case 'citizen': navigate('/citizen/dashboard'); break;
          case 'officer': navigate('/officer/dashboard'); break;
          default: navigate('/login');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', overflowY: 'auto', paddingTop: 40, paddingBottom: 40 }}>
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <div className="auth-logo">
          <div className="brand">Jan<span>Tantra</span></div>
          <div className="tagline">🇮🇳 Digital Governance Platform</div>
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the governance platform (Age 18+ required)</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name <span className="required">*</span></label>
              <input className="form-control" placeholder="Rajesh Kumar" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Age <span className="required">*</span></label>
              <input className="form-control" type="number" min="18" max="120" placeholder="18+" value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input className="form-control" type="email" placeholder="your@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password <span className="required">*</span></label>
              <input className="form-control" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password <span className="required">*</span></label>
              <input className="form-control" type="password" placeholder="Repeat password" value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Register As <span className="required">*</span></label>
              <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="citizen">Citizen</option>
                <option value="officer">Local Officer (Needs Approval)</option>
                <option value="authority">Authority (Needs Approval)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Area <span className="required">*</span></label>
              <select className="form-control" value={form.areaId} onChange={e => setForm({ ...form, areaId: e.target.value })} required>
                <option value="">Select your area</option>
                {areas.map(a => <option key={a._id} value={a._id}>{a.name}, {a.district}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-control" type="tel" placeholder="9876543210" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>

          {(form.role === 'officer' || form.role === 'authority') && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input className="form-control" placeholder="e.g. Ward Officer" value={form.designation}
                  onChange={e => setForm({ ...form, designation: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input className="form-control" placeholder="e.g. OFC001" value={form.employeeId}
                  onChange={e => setForm({ ...form, employeeId: e.target.value })} />
              </div>
            </div>
          )}

          {form.role !== 'citizen' && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 16 }}>
              ⚠️ Officer/Authority accounts require admin approval before login access is granted.
            </div>
          )}

          <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}>
            {loading ? 'Creating Account...' : 'Create My Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
        <div className="auth-switch mt-8">
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: 13 }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
