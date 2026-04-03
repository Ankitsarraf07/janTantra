import { useState, useEffect } from 'react';
import { fundAPI, areaAPI } from '../../api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function FundManage() {
  const { user } = useAuth();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txModal, setTxModal] = useState(null);
  const [txForm, setTxForm] = useState({ description: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ status: '' });

  const fetchFunds = () => {
    fundAPI.getAll({ ...filters, limit: 50 }).then(r => setFunds(r.data.funds || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(() => { fetchFunds(); }, [filters]);

  const handleAddTx = async () => {
    if (!txForm.description || !txForm.amount) return toast.error('Fill in transaction details');
    setSubmitting(true);
    try {
      await fundAPI.addTransaction(txModal._id, { description: txForm.description, amount: Number(txForm.amount) });
      toast.success('Transaction recorded!');
      setTxModal(null); setTxForm({ description: '', amount: '' });
      fetchFunds();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } 
    finally { setSubmitting(false); }
  };

  const utilPct = (f) => f.amount > 0 ? Math.round((f.amountUtilized / f.amount) * 100) : 0;
  const can = user.role === 'authority' || user.role === 'admin';

  return (
    <div>
      <div className="page-title">Fund Management</div>
      <div className="page-subtitle">Track utilization and record spending transactions</div>

      <div className="filters-bar">
        <select className="filter-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {['allocated', 'active', 'completed', 'overdue'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-outline btn-sm" onClick={() => setFilters({ status: '' })}>Clear</button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"></div></div> :
        funds.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">💰</div><div className="empty-title">No funds found</div></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Fund Title</th><th>Area</th><th>Category</th><th>Amount</th><th>Utilized</th><th>Progress</th><th>Status</th><th>Deadline</th>{can && <th>Action</th>}</tr>
              </thead>
              <tbody>
                {funds.map(fund => (
                  <tr key={fund._id}>
                    <td>
                      <div className="td-bold" style={{ maxWidth: 180 }}>{fund.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>by {fund.allocatedBy?.name}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{fund.areaId?.name}</td>
                    <td><span className="badge badge-primary">{fund.category}</span></td>
                    <td style={{ fontWeight: 700 }}>₹{(fund.amount / 100000).toFixed(2)}L</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{((fund.amountUtilized || 0) / 100000).toFixed(2)}L</td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${utilPct(fund)}%`, height: '100%', background: utilPct(fund) >= 90 ? 'var(--success)' : 'var(--primary)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, minWidth: 30 }}>{utilPct(fund)}%</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${fund.status === 'completed' ? 'resolved' : fund.status === 'overdue' ? 'overdue' : fund.status === 'active' ? 'in-progress' : 'primary'}`}>{fund.status}</span></td>
                    <td style={{ fontSize: 12 }}>{new Date(fund.deadline).toLocaleDateString()}</td>
                    {can && (
                      <td>
                        {fund.status !== 'completed' && fund.status !== 'cancelled' && (
                          <button className="btn btn-sm btn-success" onClick={() => setTxModal(fund)}>+ Transaction</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Add Transaction Modal */}
      {txModal && (
        <div className="modal-overlay" onClick={() => setTxModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Record Transaction</div>
              <button className="modal-close" onClick={() => setTxModal(null)}>✕</button>
            </div>
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ fontWeight: 600 }}>{txModal.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Remaining: ₹{((txModal.amount - (txModal.amountUtilized || 0)) / 1000).toFixed(1)}K</div>
            </div>
            <div className="form-group">
              <label className="form-label">Description <span className="required">*</span></label>
              <input className="form-control" placeholder="e.g. Payment for road materials – Batch 1"
                value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) <span className="required">*</span></label>
              <input className="form-control" type="number" min="1" placeholder="e.g. 50000"
                value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
              {txForm.amount && <div className="form-hint">≈ ₹{(Number(txForm.amount) / 1000).toFixed(2)}K</div>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setTxModal(null)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-success" onClick={handleAddTx} disabled={submitting} style={{ flex: 2, justifyContent: 'center' }}>
                {submitting ? 'Recording...' : '✓ Record Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
