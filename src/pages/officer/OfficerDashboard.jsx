import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { issueAPI, rankingAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      issueAPI.getAll({ limit: 50 }),
      rankingAPI.getOfficer(user._id)
    ]).then(([iRes, rRes]) => {
      setIssues(iRes.data.issues || []);
      setRanking(rRes.data.ranking);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user._id]);

  const countByStatus = (s) => issues.filter(i => i.status === s).length;
  const badgeColors = { none: '#94a3b8', bronze: '#b45309', silver: '#64748b', gold: '#92400e', platinum: '#5b21b6' };

  const radarData = ranking ? [
    { subject: 'Completion', val: ranking.completionScore || 0, fullMark: 100 },
    { subject: 'Feedback', val: (ranking.feedbackScore || 0) * 20, fullMark: 100 },
    { subject: 'Speed', val: Math.max(0, 100 - (ranking.avgResolutionTimeDays || 0) * 10), fullMark: 100 },
    { subject: 'Pending', val: Math.max(0, 100 - (ranking.pendingCount || 0) * 10), fullMark: 100 },
    { subject: 'Overall', val: ranking.overallScore || 0, fullMark: 100 },
  ] : [];

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-title">Officer Dashboard</div>
      <div className="page-subtitle">Manage assigned issues and track your performance</div>

      {/* Approval Warning */}
      {!user.isApproved && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 24, color: '#92400e', fontSize: 14 }}>
          ⏳ <strong>Account Pending Approval.</strong> Admin has not yet approved your account. Some features may be limited.
        </div>
      )}

      <div className="stats-grid">
        {[
          { label: 'Total Assigned', val: issues.length, color: 'si-blue' },
          { label: 'In Progress', val: countByStatus('in-progress'), color: 'si-yellow' },
          { label: 'Resolved', val: countByStatus('resolved'), color: 'si-green' },
          { label: 'Overdue', val: countByStatus('overdue'), color: 'si-red' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`} style={{ fontSize: 20 }}>●</div>
            <div className="stat-info"><div className="stat-value">{s.val}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Performance Card */}
        {ranking ? (
          <div className="card">
            <div className="card-header">
              <div className="card-title">My Performance Score</div>
              <span style={{ background: badgeColors[ranking.badge], color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                🏅 {ranking.badge}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{ranking.overallScore}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>OVERALL</div>
              </div>
              <div style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{ranking.feedbackScore?.toFixed(1)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>FEEDBACK ★</div>
              </div>
              <div style={{ textAlign: 'center', background: 'var(--bg)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>{ranking.avgResolutionTimeDays?.toFixed(1)}d</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>AVG TIME</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar name="Score" dataKey="val" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card flex-center" style={{ minHeight: 260 }}>
            <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No ranking data yet</div></div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => navigate('/officer/issues')} style={{ justifyContent: 'flex-start' }}>📋 View All Assigned Issues</button>
              <button className="btn btn-outline" onClick={() => navigate('/officer/rankings')} style={{ justifyContent: 'flex-start' }}>🏆 Check Leaderboard</button>
            </div>
          </div>

          {/* Recent Issues */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-title" style={{ marginBottom: 14 }}>Recent Assignments</div>
            {issues.slice(0, 4).map(issue => (
              <div key={issue._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{issue.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{issue.category}</div>
                </div>
                <span className={`badge badge-${issue.status}`} style={{ fontSize: 10 }}>{issue.status}</span>
              </div>
            ))}
            {issues.length > 4 && (
              <button className="btn btn-sm btn-outline" onClick={() => navigate('/officer/issues')} style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
                View all {issues.length} issues
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
