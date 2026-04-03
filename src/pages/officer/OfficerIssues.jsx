import { useState, useEffect } from 'react';
import { issueAPI } from '../../api';
import toast from 'react-hot-toast';

export default function OfficerIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '' });
  const [updating, setUpdating] = useState(null);
  const [selected, setSelected] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', workNote: '' });

  const fetchIssues = () => {
    issueAPI.getAll({ ...filters, limit: 50 })
      .then(r => setIssues(r.data.issues || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchIssues(); }, [filters]);

  const openUpdate = (issue) => {
    setSelected(issue);
    setUpdateForm({ status: issue.status, workNote: '' });
  };

  const handleUpdate = async () => {
    if (!updateForm.status) return toast.error('Please select a status');
    setUpdating(selected._id);
    try {
      await issueAPI.updateStatus(selected._id, updateForm);
      toast.success('Issue updated successfully');
      setSelected(null);
      fetchIssues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const statusOrder = ['open', 'assigned', 'in-progress', 'resolved', 'overdue', 'rejected'];
  const nextStatuses = (current) => statusOrder.filter(s => s !== current && s !== 'open' && s !== 'overdue');

  return (
    <div>
      <div className="page-title">Assigned Issues</div>
      <div className="page-subtitle">Review and update the status of issues in your area</div>

      <div className="filters-bar">
        <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {['open', 'assigned', 'in-progress', 'resolved', 'overdue'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={() => setFilters({ status: '' })}>Clear</button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : issues.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📪</div><div className="empty-title">No issues assigned</div><div className="empty-desc">You have no issues assigned to you in this area yet</div></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Issue</th><th>Category</th><th>Priority</th><th>Status</th><th>Reported By</th><th>Deadline</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(issue => {
                const isOverdue = issue.deadline && new Date() > new Date(issue.deadline) && !['resolved', 'rejected'].includes(issue.status);
                return (
                  <tr key={issue._id}>
                    <td>
                      <div className="td-bold">{issue.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{issue.areaId?.name}</div>
                    </td>
                    <td><span className="badge badge-primary">{issue.category}</span></td>
                    <td><span className={`badge priority-${issue.priority}`}>{issue.priority}</span></td>
                    <td><span className={`badge badge-${issue.status}`}>{issue.status}</span></td>
                    <td style={{ fontSize: 13 }}>{issue.reportedBy?.name}</td>
                    <td>
                      {issue.deadline ? (
                        <span style={{ fontSize: 12, color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: isOverdue ? 700 : 400 }}>
                          {isOverdue ? '⚠️ ' : ''}{new Date(issue.deadline).toLocaleDateString()}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No deadline</span>}
                    </td>
                    <td>
                      {!['resolved', 'rejected'].includes(issue.status) && (
                        <button className="btn btn-sm btn-primary" onClick={() => openUpdate(issue)}>Update</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Status Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Update Issue Status</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{selected.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{selected.description?.slice(0, 120)}...</div>
            </div>
            <div className="form-group">
              <label className="form-label">New Status <span className="required">*</span></label>
              <select className="form-control" value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}>
                <option value="">Select status</option>
                {nextStatuses(selected.status).map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Work Note (Optional)</label>
              <textarea className="form-control" rows={3}
                placeholder="Describe what work has been done or what the current situation is..."
                value={updateForm.workNote} onChange={e => setUpdateForm({ ...updateForm, workNote: e.target.value })} />
            </div>
            {updateForm.status === 'resolved' && (
              <div style={{ background: 'var(--success-light)', border: '1px solid #86efac', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#166534', marginBottom: 16 }}>
                ✅ Marking as resolved will update your performance score and notify citizens for feedback.
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setSelected(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={!!updating} style={{ flex: 2, justifyContent: 'center' }}>
                {updating === selected._id ? 'Updating...' : 'Save Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
