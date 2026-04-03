import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { issueAPI, areaAPI } from '../../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['road', 'water', 'electricity', 'sanitation', 'health', 'education', 'safety', 'environment', 'infrastructure', 'other'];

export default function PostIssue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'road', priority: 'medium',
    areaId: typeof user?.areaId === 'object' ? user?.areaId?._id : user?.areaId || '',
    landmark: '', deadline: ''
  });

  useEffect(() => { areaAPI.getAll().then(r => setAreas(r.data.areas || [])).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return toast.error('Please fill in all required fields');
    setLoading(true);
    try {
      const payload = {
        title: form.title, description: form.description,
        category: form.category, priority: form.priority,
        areaId: form.areaId,
        location: { landmark: form.landmark },
        deadline: form.deadline ? new Date(form.deadline) : undefined
      };
      await issueAPI.create(payload);
      toast.success('Issue reported successfully! Authorities have been notified.');
      navigate('/citizen/issues');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit issue');
    } finally { setLoading(false); }
  };

  const tips = [
    '📸 Be specific about the exact location',
    '📝 Include details like duration of the problem',
    '⚠️ Set priority based on safety impact',
    '📅 Optional: suggest a resolution deadline',
  ];

  return (
    <div>
      <div className="page-title">Report an Issue</div>
      <div className="page-subtitle">File a complaint about a public problem in your area</div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Issue Title <span className="required">*</span></label>
              <input className="form-control" placeholder="e.g. Large pothole near bus stop on MG Road"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority <span className="required">*</span></label>
                <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low — Minor inconvenience</option>
                  <option value="medium">Medium — Affects daily life</option>
                  <option value="high">High — Safety concern</option>
                  <option value="critical">Critical — Immediate danger</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description <span className="required">*</span></label>
              <textarea className="form-control" rows={5}
                placeholder="Describe the issue in detail. Include: what the problem is, how long it has existed, how many people are affected, and any safety hazards..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Area <span className="required">*</span></label>
                <select className="form-control" value={form.areaId} onChange={e => setForm({ ...form, areaId: e.target.value })}>
                  <option value="">Select area</option>
                  {areas.map(a => <option key={a._id} value={a._id}>{a.name}, {a.district}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nearest Landmark</label>
                <input className="form-control" placeholder="e.g. Near Big Bazaar, Sector 4"
                  value={form.landmark} onChange={e => setForm({ ...form, landmark: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Suggested Deadline (Optional)</label>
              <input type="date" className="form-control" value={form.deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, deadline: e.target.value })} />
              <div className="form-hint">Suggest a date by which this issue should be resolved</div>
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
              {loading ? '⏳ Submitting Issue...' : '📋 Submit Issue Report'}
            </button>
          </form>
        </div>

        {/* Sidebar Tips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>📌 Tips for a Good Report</div>
            {tips.map((tip, i) => (
              <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 0', borderBottom: i < tips.length - 1 ? '1px solid var(--border)' : 'none' }}>{tip}</div>
            ))}
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))'}}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>🚔 Emergency?</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.6 }}>For life-threatening situations or crimes in progress, please call emergency services immediately.</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>112</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Emergency</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 16px', textAlign: 'center', flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>1800</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Civic Helpline</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>📊 Your Impact</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Citizens like you have helped resolve <strong>12,400+</strong> issues. Your report matters and will be reviewed by the area officer within 24 hours.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
