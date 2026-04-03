import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fundAPI, areaAPI } from '../../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['infrastructure', 'health', 'education', 'sanitation', 'water', 'electricity', 'environment', 'other'];

export default function AllocateFund() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', purpose: '', amount: '', areaId: '', category: 'infrastructure', deadline: '' });

  useEffect(() => { areaAPI.getAll().then(r => setAreas(r.data.areas || [])).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.areaId) return toast.error('Please select an area');
    if (Number(form.amount) <= 0) return toast.error('Amount must be greater than 0');
    setLoading(true);
    try {
      await fundAPI.allocate({ ...form, amount: Number(form.amount) });
      toast.success('Fund allocated successfully! It is now publicly visible.');
      navigate('/authority/funds');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to allocate fund');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-title">Allocate New Fund</div>
      <div className="page-subtitle">Approve and assign budget for public works — all allocations are publicly visible</div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Fund Title <span className="required">*</span></label>
              <input className="form-control" placeholder="e.g. Road Rehabilitation – Phase 2, Koramangala"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Area <span className="required">*</span></label>
                <select className="form-control" value={form.areaId} onChange={e => setForm({ ...form, areaId: e.target.value })} required>
                  <option value="">Select target area</option>
                  {areas.map(a => <option key={a._id} value={a._id}>{a.name}, {a.district}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category <span className="required">*</span></label>
                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹) <span className="required">*</span></label>
                <input className="form-control" type="number" min="1" placeholder="e.g. 2500000"
                  value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                {form.amount && <div className="form-hint">≈ ₹{(Number(form.amount) / 100000).toFixed(2)} Lakh</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Completion Deadline <span className="required">*</span></label>
                <input type="date" className="form-control" value={form.deadline}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm({ ...form, deadline: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose / Description <span className="required">*</span></label>
              <textarea className="form-control" rows={5}
                placeholder="Describe the objective, scope, and expected outcome of this fund. Citizens will be able to read this publicly..."
                value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} required />
            </div>

            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1e40af', marginBottom: 20 }}>
              🔓 <strong>Public Transparency:</strong> Once allocated, this fund will be visible to all citizens in the selected area. They can track utilization in real-time.
            </div>

            <button className="btn btn-accent" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15 }}>
              {loading ? '⏳ Allocating...' : '💰 Allocate Fund'}
            </button>
          </form>
        </div>

        {/* Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>📋 Allocation Guidelines</div>
            {[
              ['Specificity', 'Clearly define the scope of work and expected deliverables'],
              ['Realistic Budget', 'Ensure the amount matches market rates for the specific work'],
              ['Reasonable Deadline', 'Set a feasible deadline that accounts for procurement and weather'],
              ['Linked Issues', 'Try to link funded projects to existing citizen-reported issues'],
              ['Transparency', 'All fund details are public — be accurate and accountable'],
            ].map(([title, desc]) => (
              <div key={title} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>✓ {title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>⚡ Anti-Corruption Pledge</div>
            <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6 }}>
              All fund allocations are digitally recorded and immutable. Misuse of public funds is punishable under the Prevention of Corruption Act.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
