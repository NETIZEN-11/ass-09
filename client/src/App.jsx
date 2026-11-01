import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QRScannerPage from './pages/QRScannerPage';
import AppointmentsPage from './pages/AppointmentsPage';
import VisitorsPage from './pages/VisitorsPage';
import StaffManagementPage from './pages/StaffManagementPage';
import PassesPage from './pages/PassesPage';
import ActiveVisitorsPage from './pages/ActiveVisitorsPage';
import ExpectedVisitorsPage from './pages/ExpectedVisitorsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import VisitorHistoryPage from './pages/VisitorHistoryPage';
import InviteVisitorPage from './pages/InviteVisitorPage';
import ApprovalsPage from './pages/ApprovalsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="scanner" element={<PrivateRoute allowedRoles={['security', 'admin']}><QRScannerPage /></PrivateRoute>} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="visitors" element={<PrivateRoute allowedRoles={['admin', 'security']}><VisitorsPage /></PrivateRoute>} />
            <Route path="staff" element={<PrivateRoute allowedRoles={['admin']}><StaffManagementPage /></PrivateRoute>} />
            <Route path="passes" element={<PrivateRoute allowedRoles={['admin']}><PassesPage /></PrivateRoute>} />
            <Route path="active-visitors" element={<PrivateRoute allowedRoles={['security', 'admin']}><ActiveVisitorsPage /></PrivateRoute>} />
            <Route path="expected-visitors" element={<PrivateRoute allowedRoles={['security', 'admin']}><ExpectedVisitorsPage /></PrivateRoute>} />
            <Route path="reports" element={<PrivateRoute allowedRoles={['admin']}><ReportsPage /></PrivateRoute>} />
            <Route path="settings" element={<PrivateRoute allowedRoles={['admin']}><SettingsPage /></PrivateRoute>} />
            <Route path="visitor-history" element={<PrivateRoute allowedRoles={['security', 'admin']}><VisitorHistoryPage /></PrivateRoute>} />
            <Route path="invite-visitor" element={<PrivateRoute allowedRoles={['employee', 'admin']}><InviteVisitorPage /></PrivateRoute>} />
            <Route path="approvals" element={<PrivateRoute allowedRoles={['employee', 'admin']}><ApprovalsPage /></PrivateRoute>} />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
