import { useState, useEffect } from 'react';
import { areaAPI, userAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ManageAreas() {
  const [areas, setAreas] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editArea, setEditArea] = useState(null);
  const [form, setForm] = useState({ name: '', district: '', state: 'Karnataka', pincode: '', population: '', assignedOfficerId: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => {
    Promise.all([areaAPI.getAll(), userAPI.getAll({ role: 'officer', isApproved: 'true' })])
      .then(([aRes, uRes]) => { setAreas(aRes.data.areas || []); setOfficers(uRes.data.users || []); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditArea(null); setForm({ name: '', district: '', state: 'Karnataka', pincode: '', population: '', assignedOfficerId: '' }); setShowModal(true); };
  const openEdit = (a) => { setEditArea(a); setForm({ name: a.name, district: a.district, state: a.state, pincode: a.pincode, population: a.population, assignedOfficerId: a.assignedOfficerId?._id || '' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.district || !form.pincode) return toast.error('Fill in required fields');
    setSubmitting(true);
    try {
      if (editArea) { await areaAPI.update(editArea._id, form); toast.success('Area updated!'); }
      else { await areaAPI.create(form); toast.success('Area created!'); }
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const deleteArea = async (id, name) => {
    if (!window.confirm(`Deactivate area "${name}"?`)) return;
    try { await areaAPI.delete(id); toast.success('Area deactivated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-title">Manage Areas</div>
      <div className="page-subtitle">Configure administrative areas and assign local officers</div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={openCreate}>+ Add New Area</button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Area Name</th><th>District</th><th>State</th><th>Pincode</th><th>Population</th><th>Assigned Officer</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {areas.map(area => (
                <tr key={area._id}>
                  <td className="td-bold">{area.name}</td>
                  <td>{area.district}</td>
                  <td>{area.state}</td>
                  <td style={{ fontFamily: 'monospace' }}>{area.pincode}</td>
                  <td>{area.population?.toLocaleString() || '—'}</td>
                  <td>
                    {area.assignedOfficerId
                      ? <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{area.assignedOfficerId.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{area.assignedOfficerId.designation}</div>
                        </div>
                      : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unassigned</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => openEdit(area)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteArea(area._id, area.name)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
              {areas.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No areas configured</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editArea ? 'Edit Area' : 'Create New Area'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Area Name <span className="required">*</span></label>
                <input className="form-control" placeholder="e.g. Koramangala" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode <span className="required">*</span></label>
                <input className="form-control" placeholder="560034" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">District <span className="required">*</span></label>
                <input className="form-control" placeholder="Bangalore Urban" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-control" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Population</label>
                <input className="form-control" type="number" placeholder="85000" value={form.population} onChange={e => setForm({ ...form, population: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Officer</label>
                <select className="form-control" value={form.assignedOfficerId} onChange={e => setForm({ ...form, assignedOfficerId: e.target.value })}>
                  <option value="">No officer</option>
                  {officers.map(o => <option key={o._id} value={o._id}>{o.name} — {o.designation || o.email}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={submitting} style={{ flex: 2, justifyContent: 'center' }}>
                {submitting ? 'Saving...' : editArea ? 'Update Area' : 'Create Area'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
