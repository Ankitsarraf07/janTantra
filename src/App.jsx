import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AppLayout from './components/layout/AppLayout';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import IssuesList from './pages/citizen/IssuesList';
import PostIssue from './pages/citizen/PostIssue';
import FundsList from './pages/citizen/FundsList';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerIssues from './pages/officer/OfficerIssues';
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import AllocateFund from './pages/authority/AllocateFund';
import FundManage from './pages/authority/FundManage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageAreas from './pages/admin/ManageAreas';
import Rankings from './pages/Rankings';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'citizen': return <Navigate to="/citizen/dashboard" replace />;
    case 'officer': return <Navigate to="/officer/dashboard" replace />;
    case 'authority': return <Navigate to="/authority/dashboard" replace />;
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500, style: { borderRadius: '12px', fontSize: '14px', fontWeight: 500 } }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardRoute />} />

        {/* Citizen */}
        <Route path="/citizen" element={<ProtectedRoute roles={['citizen', 'admin']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<CitizenDashboard />} />
          <Route path="issues" element={<IssuesList />} />
          <Route path="report" element={<PostIssue />} />
          <Route path="funds" element={<FundsList />} />
          <Route path="rankings" element={<Rankings />} />
        </Route>

        {/* Officer */}
        <Route path="/officer" element={<ProtectedRoute roles={['officer', 'admin']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<OfficerDashboard />} />
          <Route path="issues" element={<OfficerIssues />} />
          <Route path="rankings" element={<Rankings />} />
        </Route>

        {/* Authority */}
        <Route path="/authority" element={<ProtectedRoute roles={['authority', 'admin']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AuthorityDashboard />} />
          <Route path="allocate-fund" element={<AllocateFund />} />
          <Route path="funds" element={<FundManage />} />
          <Route path="rankings" element={<Rankings />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="areas" element={<ManageAreas />} />
          <Route path="issues" element={<IssuesList />} />
          <Route path="funds" element={<FundManage />} />
          <Route path="rankings" element={<Rankings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
