import { useState, useEffect } from 'react';
import { fundAPI } from '../../api';

export default function FundsList() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [selected, setSelected] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    Promise.all([fundAPI.getAll(filters), fundAPI.getStats()])
      .then(([r, sr]) => { setFunds(r.data.funds || []); setStats(sr.data.stats || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters]);

  const utilPct = (f) => f.amount > 0 ? Math.round((f.amountUtilized / f.amount) * 100) : 0;
  const fillColor = (pct) => pct >= 90 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--info)';

  const statusColor = { allocated: 'badge-primary', active: 'badge-in-progress', completed: 'badge-resolved', overdue: 'badge-overdue', cancelled: 'badge-rejected' };

  return (
    <div>
      <div className="page-title">Public Fund Tracker</div>
      <div className="page-subtitle">Transparency in every rupee — area-wise fund allocation & utilization</div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon si-purple" style={{ fontSize: 20 }}>₹</div>
          <div className="stat-info"><div className="stat-value">₹{((stats.totalAllocated || 0) / 100000).toFixed(1)}L</div><div className="stat-label">Total Allocated</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-green" style={{ fontSize: 20 }}>✓</div>
          <div className="stat-info"><div className="stat-value">₹{((stats.totalUtilized || 0) / 100000).toFixed(1)}L</div><div className="stat-label">Utilized</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-blue" style={{ fontSize: 16 }}>#</div>
          <div className="stat-info"><div className="stat-value">{stats.count || 0}</div><div className="stat-label">Active Projects</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-yellow" style={{ fontSize: 16 }}>%</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalAllocated > 0 ? Math.round((stats.totalUtilized / stats.totalAllocated) * 100) : 0}%</div>
            <div className="stat-label">Utilization Rate</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {['allocated', 'active', 'completed', 'overdue', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {['infrastructure', 'health', 'education', 'sanitation', 'water', 'electricity', 'environment', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={() => setFilters({ status: '', category: '' })}>Clear</button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : funds.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">💰</div><div className="empty-title">No funds found</div><div className="empty-desc">No funds have been allocated in your area yet</div></div>
      ) : (
        <div className="grid-2">
          {funds.map(fund => (
            <div key={fund._id} className="fund-card" onClick={() => setSelected(fund)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div className="fund-title">{fund.title}</div>
                <span className={`badge ${statusColor[fund.status] || 'badge-primary'}`}>{fund.status}</span>
              </div>
              <div className="fund-meta">
                {fund.areaId?.name} • {fund.category} • by {fund.allocatedBy?.name}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {fund.purpose}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span className="fund-amount">₹{(fund.amount / 100000).toFixed(2)}L</span>
                  <span className="fund-amount-label"> total</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: fillColor(utilPct(fund)) }}>
                  {utilPct(fund)}% used
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${utilPct(fund)}%`, background: fillColor(utilPct(fund)) }} />
              </div>
              <div className="progress-labels">
                <span>₹{(fund.amountUtilized / 100000).toFixed(2)}L utilized</span>
                <span>Deadline: {new Date(fund.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fund Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{selected.title}</div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className={`badge ${statusColor[selected.status]}`}>{selected.status}</span>
              <span className="badge badge-primary">{selected.category}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{selected.purpose}</p>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>₹{(selected.amount/100000).toFixed(2)}L</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ALLOCATED</div></div>
                <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>₹{((selected.amountUtilized||0)/100000).toFixed(2)}L</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>UTILIZED</div></div>
                <div><div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)' }}>{utilPct(selected)}%</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>UTILIZATION</div></div>
              </div>
              <div className="progress-bar" style={{ marginTop: 16 }}>
                <div className="progress-fill" style={{ width: `${utilPct(selected)}%`, background: fillColor(utilPct(selected)) }} />
              </div>
            </div>
            <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Area: </span><strong>{selected.areaId?.name}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Allocated by: </span><strong>{selected.allocatedBy?.name}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Deadline: </span><strong>{new Date(selected.deadline).toLocaleDateString()}</strong></div>
              {selected.completedAt && <div><span style={{ color: 'var(--text-muted)' }}>Completed: </span><strong>{new Date(selected.completedAt).toLocaleDateString()}</strong></div>}
            </div>
            {selected.transactions?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Transaction History</div>
                {selected.transactions.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.description}</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{(t.amount/1000).toFixed(1)}K</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
