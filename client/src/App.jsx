import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import OtpVerification from './pages/OtpVerification';
import ChangePassword from './pages/ChangePassword';
import PasswordSuccess from './pages/PasswordSuccess';
import AuthLayout from './components/AuthLayout';
import DashboardLayout from './components/DashboardLayout';
import AgentDashboardLayout from './components/AgentDashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Contacts from './pages/Contacts';
import Subscriptions from './pages/Subscriptions';
import CompanyManagement from './pages/CompanyManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AgentDashboardHome from './pages/agent/AgentDashboardHome';
import AgentContactManagement from './pages/agent/AgentContactManagement';
import AgentProductManagement from './pages/agent/AgentProductManagement';
import AgentBillingPage from './pages/agent/AgentBillingPage';
import AgentSettings from './pages/agent/AgentSettings';
import { ROLE_ADMIN, ROLE_USER } from './lib/roles';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp-verification" element={<OtpVerification />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/password-success" element={<PasswordSuccess />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            {/* Super admin / platform admin */}
            <Route element={<RequireRole allowedRoles={[ROLE_ADMIN]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/contacts" element={<Navigate to="/contacts/unassigned" replace />} />
                <Route path="/contacts/unassigned" element={<Contacts />} />
                <Route path="/contacts/assigned" element={<Contacts />} />
                <Route path="/contacts/log" element={<Contacts />} />
                <Route path="/companies/:tabId?" element={<CompanyManagement />} />
                <Route path="/billing" element={<Subscriptions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Company agent (role user) */}
            <Route element={<RequireRole allowedRoles={[ROLE_USER]} />}>
              <Route element={<AgentDashboardLayout />}>
                <Route path="/agent/dashboard" element={<AgentDashboardHome />} />
                <Route path="/agent/messages" element={<Messages />} />
                <Route path="/agent/contacts" element={<AgentContactManagement />} />
                <Route path="/agent/products" element={<AgentProductManagement />} />
                <Route path="/agent/reports" element={<Reports />} />
                <Route path="/agent/billing" element={<AgentBillingPage />} />
                <Route path="/agent/settings" element={<AgentSettings />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
