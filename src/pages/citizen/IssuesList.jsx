import { useState, useEffect } from 'react';
import { issueAPI, feedbackAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['road', 'water', 'electricity', 'sanitation', 'health', 'education', 'safety', 'environment', 'infrastructure', 'other'];

export default function IssuesList() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '' });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, workStatus: 'in_progress', comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchIssues = () => {
    setLoading(true);
    issueAPI.getAll({ ...filters, limit: 20 })
      .then(r => setIssues(r.data.issues || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchIssues(); }, [filters]);

  const handleFeedback = async (issueId) => {
    setSubmittingFeedback(true);
    try {
      await feedbackAPI.submit({ issueId, ...feedback });
      toast.success('Feedback submitted!');
      setSelectedIssue(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally { setSubmittingFeedback(false); }
  };

  const getStatusClass = (s) => `badge badge-${s.replace('-', '-')}`;

  return (
    <div>
      <div className="page-title">Area Issues</div>
      <div className="page-subtitle">Browse and track all reported issues in your area</div>

      {/* Filters */}
      <div className="filters-bar">
        <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {['open', 'assigned', 'in-progress', 'resolved', 'overdue', 'rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priority</option>
          {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={() => setFilters({ status: '', category: '', priority: '' })}>Clear</button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : issues.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-title">No issues found</div><div className="empty-desc">Try adjusting filters or check back later</div></div>
      ) : (
        <div className="issues-grid">
          {issues.map(issue => (
            <div key={issue._id} className="issue-card" onClick={() => setSelectedIssue(issue)}>
              <div className="issue-card-header">
                <div className="issue-card-title">{issue.title}</div>
                <span className={getStatusClass(issue.status)}>{issue.status}</span>
              </div>
              <div className="issue-card-desc">{issue.description}</div>
              <div className="issue-card-meta">
                <span className={`badge priority-${issue.priority}`}>{issue.priority}</span>
                <span className="badge badge-primary">{issue.category}</span>
                <span className="issue-meta-item">📍 {issue.areaId?.name}</span>
                <span className="issue-meta-item">👤 {issue.reportedBy?.name}</span>
                <span className="issue-meta-item">🗓 {new Date(issue.createdAt).toLocaleDateString()}</span>
                {issue.assignedTo && <span className="issue-meta-item">🛡 {issue.assignedTo?.name}</span>}
              </div>
              {issue.upvotes?.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>👍 {issue.upvotes.length} upvotes</div>}
            </div>
          ))}
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="modal-overlay" onClick={() => setSelectedIssue(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selectedIssue.title}</div>
              <button className="modal-close" onClick={() => setSelectedIssue(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span className={`badge badge-${selectedIssue.status}`}>{selectedIssue.status}</span>
              <span className={`badge priority-${selectedIssue.priority}`}>{selectedIssue.priority}</span>
              <span className="badge badge-primary">{selectedIssue.category}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{selectedIssue.description}</p>
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Reported by: </span>{selectedIssue.reportedBy?.name}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Area: </span>{selectedIssue.areaId?.name}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Officer: </span>{selectedIssue.assignedTo?.name || 'Unassigned'}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Date: </span>{new Date(selectedIssue.createdAt).toLocaleDateString()}</div>
                {selectedIssue.deadline && <div><span style={{ color: 'var(--text-muted)' }}>Deadline: </span>{new Date(selectedIssue.deadline).toLocaleDateString()}</div>}
                {selectedIssue.resolvedAt && <div><span style={{ color: 'var(--text-muted)' }}>Resolved: </span>{new Date(selectedIssue.resolvedAt).toLocaleDateString()}</div>}
              </div>
            </div>

            {user?.role === 'citizen' && (
              <div>
                <div className="section-title" style={{ fontSize: 15 }}>Submit Feedback</div>
                <div className="form-group">
                  <label className="form-label">Your Rating (1-5)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} onClick={() => setFeedback({ ...feedback, rating: r })}
                        style={{ width: 36, height: 36, borderRadius: 8, border: '2px solid', borderColor: feedback.rating >= r ? '#f59e0b' : 'var(--border)', background: feedback.rating >= r ? '#fef3c7' : 'transparent', fontSize: 18, cursor: 'pointer' }}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Work Status</label>
                  <select className="form-control" value={feedback.workStatus} onChange={e => setFeedback({ ...feedback, workStatus: e.target.value })}>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="poor_quality">Poor Quality</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment (Optional)</label>
                  <textarea className="form-control" rows={3} placeholder="Share your thoughts on the work..."
                    value={feedback.comment} onChange={e => setFeedback({ ...feedback, comment: e.target.value })} />
                </div>
                <button className="btn btn-primary w-full" onClick={() => handleFeedback(selectedIssue._id)} disabled={submittingFeedback} style={{ width: '100%', justifyContent: 'center' }}>
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
