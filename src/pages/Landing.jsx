import { useNavigate } from 'react-router-dom';
import { MdShield, MdPeople, MdTrendingUp, MdAccountBalance, MdReportProblem, MdVisibility } from 'react-icons/md';
import { FiArrowRight } from 'react-icons/fi';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: '🏘️', color: '#dbeafe', label: 'Area-Based Reporting', desc: 'Citizens report issues specific to their locality with location-tagged complaints.' },
    { icon: '💰', color: '#dcfce7', label: 'Fund Transparency', desc: 'Every rupee allocated is publicly visible. Track utilization in real-time.' },
    { icon: '⭐', color: '#fef3c7', label: 'Officer Accountability', desc: 'Performance-based ranking ensures officers are measured on results, not tenure.' },
    { icon: '🔒', color: '#ede9fe', label: 'Secure Role-Based Access', desc: 'JWT auth with 4 distinct roles — Citizen, Officer, Authority & Admin.' },
    { icon: '📊', color: '#fed7aa', label: 'Real-Time Analytics', desc: 'Higher authorities see live dashboards of issue resolution and fund efficiency.' },
    { icon: '🔔', color: '#fce7f3', label: 'Citizen Feedback Loop', desc: 'Locals rate completed work ensuring quality and preventing corruption.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Gov Banner */}
      <div style={{ background: '#001f3f', color: '#fff', fontSize: 13, padding: '8px 40px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>🇮🇳</span>
        <span>An official website of the <strong>Jan-Tantra Platform</strong></span>
      </div>

      {/* Nav */}
      <nav className="public-nav" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', height: 80 }}>
        <div className="nav-brand" style={{ color: 'var(--primary)' }}>
          Jan<span style={{ color: 'var(--accent)' }}>Tantra</span>
        </div>
        <div className="nav-links">
          <a className="nav-link" href="#features" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Features</a>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Join Now</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="landing-hero" style={{ background: 'var(--primary)', color: '#fff', padding: '100px 40px', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-content" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 24, lineHeight: 1.2 }}>
            Transparent Local Governance for All Citizens
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.9)', marginBottom: 40, lineHeight: 1.6 }}>
            Report issues, track fund allocation, and hold officers accountable — all in one accessible platform built for public transparency.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-lg" style={{ background: 'var(--accent)', color: '#fff', fontSize: 18, padding: '16px 32px' }} onClick={() => navigate('/register')}>
              Report an Issue
            </button>
            <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)', fontSize: 18, padding: '16px 32px', fontWeight: 700 }} onClick={() => navigate('/login')}>
              View Authority Dashboards
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="features-section" id="features">
        <h2 className="features-title">One Platform. Complete Governance.</h2>
        <p className="features-subtitle">Designed for every stakeholder — from the street to the secretariat.</p>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.label} className="feature-card">
              <div className="feature-icon" style={{ background: f.color }}>{f.icon}</div>
              <div className="feature-title">{f.label}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles Section */}
      <div style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '60px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h3 className="features-title" style={{ textAlign: 'center', marginBottom: 8 }}>Built for Every Role</h3>
          <p className="features-subtitle" style={{ textAlign: 'center', marginBottom: 40 }}>Four secure role-based portals with tailored access</p>
          <div className="grid-4">
            {[
              { icon: <MdPeople size={28} />, role: 'Citizen', color: '#2563eb', bg: '#dbeafe', desc: 'Report issues, track resolution, give feedback on public works', action: () => navigate('/register') },
              { icon: <MdShield size={28} />, role: 'Officer', color: '#16a34a', bg: '#dcfce7', desc: 'View assigned issues, update status, manage work within deadlines', action: () => navigate('/login') },
              { icon: <MdAccountBalance size={28} />, role: 'Authority', color: '#7c3aed', bg: '#ede9fe', desc: 'Allocate funds, monitor analytics, review officer performance', action: () => navigate('/login') },
              { icon: <MdTrendingUp size={28} />, role: 'Admin', color: '#dc2626', bg: '#fee2e2', desc: 'Full system control — users, areas, roles and all data', action: () => navigate('/login') },
            ].map(r => (
              <div key={r.role} className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={r.action}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: 60, height: 60, borderRadius: 16, background: r.bg, color: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{r.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{r.role}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-sidebar)', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '24px', fontSize: 13 }}>
        <div style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          Jan<span style={{ color: 'var(--accent)' }}>Tantra</span>
        </div>
        <div>Digital Governance Platform &copy; 2024 — Built with MERN Stack</div>
      </footer>
    </div>
  );
}
