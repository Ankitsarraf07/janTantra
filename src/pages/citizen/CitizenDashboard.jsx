import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { issueAPI, fundAPI } from '../../api';
import { MdReportProblem, MdCheckCircle, MdAccessTime, MdWarning } from 'react-icons/md';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS = { open: '#0284c7', assigned: '#4338ca', 'in-progress': '#d97706', resolved: '#16a34a', overdue: '#dc2626', rejected: '#94a3b8' };

export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issueStats, setIssueStats] = useState({ stats: [], categoryStats: [] });
  const [fundStats, setFundStats] = useState({});
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      issueAPI.getStats(),
      fundAPI.getStats(),
      issueAPI.getAll({ limit: 5 })
    ]).then(([statsRes, fundRes, issuesRes]) => {
      setIssueStats(statsRes.data);
      setFundStats(fundRes.data.stats || {});
      setRecentIssues(issuesRes.data.issues || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getStatCount = (status) => {
    const found = issueStats.stats?.find(s => s._id === status);
    return found?.count || 0;
  };

  const pieData = issueStats.stats?.map(s => ({ name: s._id, value: s.count, color: STATUS_COLORS[s._id] || '#ccc' })) || [];
  const catData = issueStats.categoryStats?.map(c => ({ name: c._id, count: c.count })).slice(0, 6) || [];

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-title">Good day, {user?.name?.split(' ')[0]}! 👋</div>
      <div className="page-subtitle">Here's what's happening in {typeof user?.areaId === 'object' ? user.areaId?.name : 'your area'}</div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon si-blue"><MdReportProblem /></div>
          <div className="stat-info"><div className="stat-value">{getStatCount('open') + getStatCount('assigned')}</div><div className="stat-label">Open Issues</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-yellow"><MdAccessTime /></div>
          <div className="stat-info"><div className="stat-value">{getStatCount('in-progress')}</div><div className="stat-label">In Progress</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-green"><MdCheckCircle /></div>
          <div className="stat-info"><div className="stat-value">{getStatCount('resolved')}</div><div className="stat-label">Resolved</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-red"><MdWarning /></div>
          <div className="stat-info"><div className="stat-value">{getStatCount('overdue')}</div><div className="stat-label">Overdue</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-purple" style={{ fontSize: 20 }}>₹</div>
          <div className="stat-info"><div className="stat-value">{fundStats.count || 0}</div><div className="stat-label">Active Funds</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon si-teal" style={{ fontSize: 20 }}>%</div>
          <div className="stat-info"><div className="stat-value">{fundStats.totalAllocated > 0 ? Math.round((fundStats.totalUtilized / fundStats.totalAllocated) * 100) : 0}%</div><div className="stat-label">Fund Utilization</div></div>
        </div>
      </div>

      {/* Charts + Recent */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Issue Status Chart */}
        <div className="card">
          <div className="card-header"><div className="card-title">Issues by Status</div></div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(val, name) => [val, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {pieData.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color }} />
                <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{p.name} ({p.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Chart */}
        <div className="card">
          <div className="card-header"><div className="card-title">Issues by Category</div></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--primary-light)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/citizen/report')}>📋 Report New Issue</button>
          <button className="btn btn-outline" onClick={() => navigate('/citizen/issues')}>🔍 Browse Issues</button>
          <button className="btn btn-outline" onClick={() => navigate('/citizen/funds')}>💰 View Public Funds</button>
          <button className="btn btn-outline" onClick={() => navigate('/citizen/rankings')}>🏆 See Rankings</button>
        </div>
      </div>

      {/* Recent Issues */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Area Issues</div>
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/citizen/issues')}>View All</button>
        </div>
        {recentIssues.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No issues yet</div><div className="empty-desc">Be the first to report an issue in your area!</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentIssues.map(issue => (
              <div key={issue._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--bg)', borderRadius: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{issue.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{issue.category} • {new Date(issue.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`badge badge-${issue.status.replace('-', '-')}`}>{issue.status}</span>
                <span className={`badge priority-${issue.priority}`}>{issue.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
