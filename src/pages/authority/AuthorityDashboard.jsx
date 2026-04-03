import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueAPI, fundAPI, rankingAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([rankingAPI.getAnalytics(), rankingAPI.getAll()])
      .then(([aRes, rRes]) => {
        setAnalytics(aRes.data);
        setRankings(rRes.data.rankings?.slice(0, 5) || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const badgeStyle = { platinum: { bg: '#ede9fe', color: '#5b21b6' }, gold: { bg: '#fef3c7', color: '#92400e' }, silver: { bg: '#f1f5f9', color: '#475569' }, bronze: { bg: '#fed7aa', color: '#7c2d12' }, none: { bg: '#f8fafc', color: '#94a3b8' } };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  const ov = analytics?.overview || {};
  const fundStats = [
    { name: 'Allocated', value: ov.totalFundsAllocated / 100000 || 0 },
    { name: 'Utilized', value: ov.totalFundsUtilized / 100000 || 0 },
    { name: 'Remaining', value: ((ov.totalFundsAllocated - ov.totalFundsUtilized) / 100000) || 0 },
  ];

  return (
    <div>
      <div className="page-title">Authority Dashboard</div>
      <div className="page-subtitle">Governance overview — funds, issues, officer performance</div>

      {/* Key stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Issues', val: ov.totalIssues || 0, color: 'si-blue', icon: '📋' },
          { label: 'Resolved', val: ov.resolvedIssues || 0, color: 'si-green', icon: '✅' },
          { label: 'Overdue', val: ov.overdueIssues || 0, color: 'si-red', icon: '⚠️' },
          { label: 'Resolution Rate', val: `${ov.resolutionRate || 0}%`, color: 'si-teal', icon: '📈' },
          { label: 'Funds Allocated', val: `₹${((ov.totalFundsAllocated || 0) / 100000).toFixed(1)}L`, color: 'si-purple', icon: '💰' },
          { label: 'Avg Citizen Rating', val: `${ov.avgCitizenRating || '0.0'} ★`, color: 'si-yellow', icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`} style={{ fontSize: 20 }}>{s.icon}</div>
            <div className="stat-info"><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Fund Chart */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Fund Utilization (Lakh ₹)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fundStats}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`₹${v.toFixed(2)}L`]} />
              <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]}>
                {fundStats.map((_, i) => (
                  <rect key={i} fill={['var(--primary)', 'var(--success)', 'var(--warning)'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: '💰 Allocate New Fund', desc: 'Assign budget to an area project', path: '/authority/allocate-fund', style: 'btn-accent' },
              { label: '📊 Manage Funds', desc: 'Track and update existing funds', path: '/authority/funds', style: 'btn-outline' },
              { label: '🏆 View Rankings', desc: 'Officer performance leaderboard', path: '/authority/rankings', style: 'btn-outline' },
            ].map(a => (
              <div key={a.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</div>
                </div>
                <button className={`btn btn-sm ${a.style}`} onClick={() => navigate(a.path)}>Go →</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Officers */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Top Performing Officers</div>
          <button className="btn btn-sm btn-outline" onClick={() => navigate('/authority/rankings')}>View All</button>
        </div>
        {rankings.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏅</div><div className="empty-title">No ranking data yet</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rankings.map((r, i) => {
              const bs = badgeStyle[r.badge] || badgeStyle.none;
              return (
                <div key={r._id} className="rank-card" style={{ padding: '14px 16px' }}>
                  <div className={`rank-number ${i < 3 ? `rank-${i + 1}` : ''}`}>{i + 1}</div>
                  <div className="officer-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                    {r.officerId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="rank-info">
                    <div className="rank-name">{r.officerId?.name}</div>
                    <div className="rank-area">{r.areaId?.name} • {r.officerId?.designation}</div>
                    <div style={{ marginTop: 6 }}>
                      <div className="score-bar" style={{ height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                        <div className="score-bar-fill" style={{ width: `${r.overallScore}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>{r.overallScore}</div>
                    <span style={{ background: bs.bg, color: bs.color, fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                      🏅 {r.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
