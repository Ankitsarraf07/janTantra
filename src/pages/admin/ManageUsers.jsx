import { useState, useEffect } from 'react';
import { userAPI } from '../../api';
import toast from 'react-hot-toast';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', isApproved: '' });
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    const params = {};
    if (filters.role) params.role = filters.role;
    if (filters.isApproved !== '') params.isApproved = filters.isApproved;
    userAPI.getAll(params).then(r => setUsers(r.data.users || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [filters]);

  const approve = async (id, name) => {
    try { await userAPI.approve(id); toast.success(`${name} approved!`); fetchUsers(); }
    catch { toast.error('Failed to approve user'); }
  };

  const deactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}? They will lose access.`)) return;
    try { await userAPI.deactivate(id); toast.success(`${name} deactivated`); fetchUsers(); }
    catch { toast.error('Failed to deactivate'); }
  };

  const changeRole = async (id, role) => {
    try { await userAPI.changeRole(id, role); toast.success('Role updated'); fetchUsers(); }
    catch { toast.error('Failed to update role'); }
  };

  const roleColor = { citizen: '#2563eb', officer: '#16a34a', authority: '#7c3aed', admin: '#dc2626' };
  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-title">Manage Users</div>
      <div className="page-subtitle">Approve officers, change roles, and manage user access</div>

      <div className="filters-bar">
        <input className="search-input" placeholder="🔍 Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
          <option value="">All Roles</option>
          {['citizen', 'officer', 'authority', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="filter-select" value={filters.isApproved} onChange={e => setFilters({ ...filters, isApproved: e.target.value })}>
          <option value="">All Status</option>
          <option value="false">Pending Approval</option>
          <option value="true">Approved</option>
        </select>
        <button className="btn btn-outline btn-sm" onClick={() => { setFilters({ role: '', isApproved: '' }); setSearch(''); }}>Clear</button>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>User</th><th>Role</th><th>Area</th><th>Age</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${roleColor[u.role]}20`, color: roleColor[u.role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="td-bold">{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                        {u.designation && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{u.designation}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <select value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                      style={{ padding: '4px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 12, background: `${roleColor[u.role]}15`, color: roleColor[u.role], fontWeight: 600, cursor: 'pointer' }}>
                      {['citizen', 'officer', 'authority', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td style={{ fontSize: 13 }}>{u.areaId ? (typeof u.areaId === 'object' ? u.areaId.name : '—') : '—'}</td>
                  <td style={{ fontSize: 13 }}>{u.age}</td>
                  <td>
                    {u.isApproved
                      ? <span className="badge badge-resolved">✓ Approved</span>
                      : <span className="badge badge-overdue">⏳ Pending</span>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!u.isApproved && (
                        <button className="btn btn-sm btn-success" onClick={() => approve(u._id, u.name)}>Approve</button>
                      )}
                      {u.isActive && (
                        <button className="btn btn-sm btn-danger" onClick={() => deactivate(u._id, u.name)}>Deactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
