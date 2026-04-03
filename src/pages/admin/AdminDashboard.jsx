import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, issueAPI, fundAPI, areaAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: [], total: 0, pending: 0 });
  const [issueStats, setIssueStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userAPI.getStats(), issueAPI.getStats()])
      .then(([uRes, iRes]) => {
        setStats({ users: uRes.data.stats || [], total: uRes.data.total, pending: uRes.data.pending });
        setIssueStats(iRes.data.stats || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const roleColor = { citizen: '#2563eb', officer: '#16a34a', authority: '#7c3aed', admin: '#dc2626' };
  const chartData = stats.users?.map(u => ({ role: u._id, count: u.count })) || [];
  const issueChartData = issueStats.map(s => ({ status: s._id, count: s.count }));

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-title">Admin Control Panel</div>
      <div className="page-subtitle">Full system management — users, areas, and governance data</div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon si-blue" style={{ fontSize: 20 }}>👥</div>
          <div className="stat-info"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Users</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-yellow" style={{ fontSize: 20 }}>⏳</div>
          <div className="stat-info"><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending Approvals</div>{stats.pending > 0 && <div className="stat-trend trend-down">Needs attention!</div>}</div>
        </div>
        {stats.users.map(u => (
          <div key={u._id} className="stat-card">
            <div className="stat-icon" style={{ background: `${roleColor[u._id]}20`, color: roleColor[u._id], fontSize: 16 }}>●</div>
            <div className="stat-info"><div className="stat-value">{u.count}</div><div className="stat-label" style={{ textTransform: 'capitalize' }}>{u._id}s</div></div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Users by Role</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="role" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Issues by Status</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={issueChartData}>
              <XAxis dataKey="status" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Management Links */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>System Management</div>
        <div className="grid-4">
          {[
            { label: 'Manage Users', desc: `${stats.pending} pending approvals`, icon: '👥', path: '/admin/users', urgent: stats.pending > 0, color: '#2563eb', bg: '#dbeafe' },
            { label: 'Manage Areas', desc: 'Add, edit, assign officers', icon: '🗺️', path: '/admin/areas', urgent: false, color: '#7c3aed', bg: '#ede9fe' },
            { label: 'All Issues', desc: 'Full system issue view', icon: '📋', path: '/admin/issues', urgent: false, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Fund Management', desc: 'View all fund allocations', icon: '💰', path: '/admin/funds', urgent: false, color: '#d97706', bg: '#fef3c7' },
          ].map(m => (
            <div key={m.label} onClick={() => navigate(m.path)}
              style={{ background: m.bg, borderRadius: 14, padding: 20, cursor: 'pointer', transition: 'all 0.2s', border: m.urgent ? `2px solid ${m.color}40` : '2px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: m.color }}>{m.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{m.desc}</div>
              {m.urgent && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: m.color }}>⚠️ Action Required</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
