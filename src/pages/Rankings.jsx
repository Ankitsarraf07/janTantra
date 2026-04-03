import { useState, useEffect } from 'react';
import { rankingAPI } from '../api';
import { areaAPI } from '../api';

const badgeStyle = {
  platinum: { bg: '#ede9fe', color: '#5b21b6', label: '🏆 Platinum' },
  gold: { bg: '#fef3c7', color: '#92400e', label: '🥇 Gold' },
  silver: { bg: '#f1f5f9', color: '#475569', label: '🥈 Silver' },
  bronze: { bg: '#fed7aa', color: '#7c2d12', label: '🥉 Bronze' },
  none: { bg: '#f8fafc', color: '#94a3b8', label: 'Unranked' },
};

export default function Rankings() {
  const [rankings, setRankings] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState('');

  useEffect(() => {
    Promise.all([rankingAPI.getAll({ areaId: areaFilter || undefined }), areaAPI.getAll()])
      .then(([rRes, aRes]) => { setRankings(rRes.data.rankings || []); setAreas(aRes.data.areas || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [areaFilter]);

  const topPodium = rankings.slice(0, 3);

  return (
    <div>
      <div className="page-title">Officer Performance Rankings</div>
      <div className="page-subtitle">Accountability leaderboard — ranked by completion, feedback & resolution speed</div>

      {/* Podium */}
      {!loading && topPodium.length >= 2 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 36, padding: '0 20px' }}>
          {/* 2nd place */}
          {topPodium[1] && (
            <div style={{ textAlign: 'center', flex: 1, maxWidth: 200 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 24, fontWeight: 800, color: '#475569', border: '3px solid #cbd5e1' }}>
                {topPodium[1].officerId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{topPodium[1].officerId?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{topPodium[1].areaId?.name}</div>
              <div style={{ background: '#f1f5f9', color: '#475569', borderRadius: '12px 12px 0 0', padding: '12px 8px', marginTop: 10, height: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900 }}>🥈</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#475569' }}>{topPodium[1].overallScore}</div>
              </div>
            </div>
          )}
          {/* 1st place */}
          {topPodium[0] && (
            <div style={{ textAlign: 'center', flex: 1, maxWidth: 220 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>👑</div>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 26, fontWeight: 800, color: '#fff', border: '4px solid #fbbf24', boxShadow: '0 8px 24px rgba(26,58,107,0.3)' }}>
                {topPodium[0].officerId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{topPodium[0].officerId?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{topPodium[0].areaId?.name}</div>
              <div style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: '#fff', borderRadius: '12px 12px 0 0', padding: '16px 8px', marginTop: 10, height: 110, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 4px 20px rgba(251,191,36,0.4)' }}>
                <div style={{ fontSize: 30, fontWeight: 900 }}>🥇</div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{topPodium[0].overallScore}</div>
              </div>
            </div>
          )}
          {/* 3rd place */}
          {topPodium[2] && (
            <div style={{ textAlign: 'center', flex: 1, maxWidth: 200 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', fontSize: 22, fontWeight: 800, color: '#7c2d12', border: '3px solid #fdba74' }}>
                {topPodium[2].officerId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{topPodium[2].officerId?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{topPodium[2].areaId?.name}</div>
              <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '12px 12px 0 0', padding: '12px 8px', marginTop: 10, height: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>🥉</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{topPodium[2].overallScore}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="filters-bar" style={{ marginBottom: 20 }}>
        <select className="filter-select" value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
          <option value="">All Areas</option>
          {areas.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
      </div>

      {/* Full Table */}
      {loading ? <div className="loading-spinner"><div className="spinner"></div></div> :
        rankings.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏅</div><div className="empty-title">No rankings yet</div><div className="empty-desc">Officer performance data will appear here once issues are assigned and resolved</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rankings.map((r, i) => {
              const bs = badgeStyle[r.badge] || badgeStyle.none;
              return (
                <div key={r._id} className={`rank-card rank-${i + 1}`}>
                  <div className="rank-number">{i + 1}</div>
                  <div className="officer-avatar">
                    {r.officerId?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="rank-info" style={{ flex: 1 }}>
                    <div className="rank-name">{r.officerId?.name}</div>
                    <div className="rank-area">{r.areaId?.name} • {r.officerId?.designation}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Resolved', val: r.completedCount, color: 'var(--success)' },
                        { label: 'Pending', val: r.pendingCount, color: 'var(--warning)' },
                        { label: 'Overdue', val: r.overdueCount, color: 'var(--danger)' },
                        { label: 'Avg Days', val: r.avgResolutionTimeDays?.toFixed(1), color: 'var(--info)' },
                      ].map(m => (
                        <div key={m.label} style={{ fontSize: 12 }}>
                          <span style={{ fontWeight: 700, color: m.color }}>{m.val}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: 3 }}>{m.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="score-bar-wrap" style={{ marginTop: 8 }}>
                      <div className="score-bar">
                        <div className="score-bar-fill" style={{ width: `${r.overallScore}%`, background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : 'var(--primary)' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 90 }}>
                    <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--primary)' }}>{r.overallScore}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>SCORE</div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{ background: bs.bg, color: bs.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{bs.label}</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: '#f59e0b' }}>
                      {'★'.repeat(Math.round(r.feedbackScore || 0))}{'☆'.repeat(5 - Math.round(r.feedbackScore || 0))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
