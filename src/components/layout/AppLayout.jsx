import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiMapPin } from 'react-icons/fi';
import {
  MdDashboard, MdReportProblem, MdAddBox, MdMonetizationOn,
  MdPeople, MdBarChart, MdMap, MdAccountBalance
} from 'react-icons/md';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { RiMedalLine } from 'react-icons/ri';

const navConfig = {
  citizen: [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/citizen/dashboard' },
    { label: 'Browse Issues', icon: <HiOutlineClipboardList />, path: '/citizen/issues' },
    { label: 'Report Issue', icon: <MdAddBox />, path: '/citizen/report' },
    { label: 'Public Funds', icon: <MdMonetizationOn />, path: '/citizen/funds' },
    { label: 'Rankings', icon: <RiMedalLine />, path: '/citizen/rankings' },
  ],
  officer: [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/officer/dashboard' },
    { label: 'My Issues', icon: <HiOutlineClipboardList />, path: '/officer/issues' },
    { label: 'Rankings', icon: <RiMedalLine />, path: '/officer/rankings' },
  ],
  authority: [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/authority/dashboard' },
    { label: 'Allocate Fund', icon: <MdAccountBalance />, path: '/authority/allocate-fund' },
    { label: 'Fund Management', icon: <MdMonetizationOn />, path: '/authority/funds' },
    { label: 'Rankings', icon: <RiMedalLine />, path: '/authority/rankings' },
  ],
  admin: [
    { label: 'Dashboard', icon: <MdDashboard />, path: '/admin/dashboard' },
    { label: 'Users', icon: <MdPeople />, path: '/admin/users' },
    { label: 'Areas', icon: <MdMap />, path: '/admin/areas' },
    { label: 'Issues', icon: <MdReportProblem />, path: '/admin/issues' },
    { label: 'Funds', icon: <MdMonetizationOn />, path: '/admin/funds' },
    { label: 'Rankings', icon: <RiMedalLine />, path: '/admin/rankings' },
  ],
};

const pageNames = {
  '/citizen/dashboard': { title: 'My Dashboard', sub: 'Your area at a glance' },
  '/citizen/issues': { title: 'Issues', sub: 'Browse area issues' },
  '/citizen/report': { title: 'Report Issue', sub: 'File a new complaint' },
  '/citizen/funds': { title: 'Public Funds', sub: 'Allocated funds transparency' },
  '/citizen/rankings': { title: 'Officer Rankings', sub: 'Performance leaderboard' },
  '/officer/dashboard': { title: 'Officer Dashboard', sub: 'Your work summary' },
  '/officer/issues': { title: 'Assigned Issues', sub: 'Manage and resolve issues' },
  '/officer/rankings': { title: 'Leaderboard', sub: 'Officer performance ranking' },
  '/authority/dashboard': { title: 'Authority Dashboard', sub: 'Governance overview' },
  '/authority/allocate-fund': { title: 'Allocate Fund', sub: 'Approve area-wise spending' },
  '/authority/funds': { title: 'Fund Management', sub: 'Track utilization' },
  '/authority/rankings': { title: 'Performance Rankings', sub: 'Officer accountability' },
  '/admin/dashboard': { title: 'Admin Panel', sub: 'System overview' },
  '/admin/users': { title: 'Manage Users', sub: 'Approve & manage accounts' },
  '/admin/areas': { title: 'Manage Areas', sub: 'Area CRUD operations' },
  '/admin/issues': { title: 'All Issues', sub: 'System-wide issues' },
  '/admin/funds': { title: 'All Funds', sub: 'System-wide fund management' },
  '/admin/rankings': { title: 'Rankings', sub: 'All officer performance' },
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = navConfig[user?.role] || [];
  const currentPage = pageNames[location.pathname] || { title: 'Jan Tantra', sub: '' };
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-title">Jan<span>Tantra</span></div>
          <div className="logo-subtitle">Digital Governance Platform</div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Navigation</div>
          {navItems.map((item) => (
            <div
              key={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{currentPage.title}</div>
            {currentPage.sub && <div className="topbar-subtitle">{currentPage.sub}</div>}
          </div>
          <div className="topbar-right">
            {user?.areaId && (
              <div className="topbar-area">
                <FiMapPin size={12} />
                {typeof user.areaId === 'object' ? user.areaId.name : 'My Area'}
              </div>
            )}
            <div className="topbar-badge">{user?.role}</div>
          </div>
        </div>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
