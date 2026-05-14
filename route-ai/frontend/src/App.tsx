import React from 'react';
import { BrowserRouter as Router, Routes as Switch, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';

// Layouts
import { Layout as AdminLayout } from './components/Layout';
import { ClientLayout } from './components/ClientLayout';
import { DriverLayout } from './components/DriverLayout';

// Admin pages
import { Dashboard }  from './pages/Dashboard';
import { Orders }     from './pages/Orders';
import { Operations } from './pages/Operations';
import { Analytics }  from './pages/Analytics';
import { Drivers }    from './pages/Drivers';
import { Settings }   from './pages/Settings';
import { Simulation } from './pages/operator/Simulation';

// Auth
import Login    from './components/Login';
import Register from './components/Register';

// Client pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { MyDeliveries }    from './pages/client/MyDeliveries';
import { NewDelivery }     from './pages/client/NewDelivery';

// Driver pages
import { DriverDashboard }    from './pages/driver/DriverDashboard';
import { AvailableMissions }  from './pages/driver/AvailableMissions';
import { ActiveMission }      from './pages/driver/ActiveMission';

// Route guard: redirect to login if no user stored
const RequireAuth: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <Switch>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/"         element={<Navigate to="/login" replace />} />

          {/* ── ADMIN ───────────────────────────────────────────────────── */}
          <Route path="/admin" element={
            <RequireAuth role="admin">
              <AdminLayout><Dashboard /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/deliveries" element={
            <RequireAuth role="admin">
              <AdminLayout><Orders /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/optimization" element={
            <RequireAuth role="admin">
              <AdminLayout><Operations /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/stats" element={
            <RequireAuth role="admin">
              <AdminLayout><Analytics /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/resources" element={
            <RequireAuth role="admin">
              <AdminLayout><Drivers /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/admin/simulation" element={
            <RequireAuth role="admin">
              <AdminLayout><Simulation /></AdminLayout>
            </RequireAuth>
          } />
          <Route path="/settings" element={
            <RequireAuth role="admin">
              <AdminLayout><Settings /></AdminLayout>
            </RequireAuth>
          } />

          {/* ── CLIENT ──────────────────────────────────────────────────── */}
          <Route path="/client" element={
            <RequireAuth role="client">
              <ClientLayout><ClientDashboard /></ClientLayout>
            </RequireAuth>
          } />
          <Route path="/client/deliveries" element={
            <RequireAuth role="client">
              <ClientLayout><MyDeliveries /></ClientLayout>
            </RequireAuth>
          } />
          <Route path="/client/new" element={
            <RequireAuth role="client">
              <ClientLayout><NewDelivery /></ClientLayout>
            </RequireAuth>
          } />

          {/* ── DRIVER ──────────────────────────────────────────────────── */}
          <Route path="/driver" element={
            <RequireAuth role="driver">
              <DriverLayout><DriverDashboard /></DriverLayout>
            </RequireAuth>
          } />
          <Route path="/driver/missions" element={
            <RequireAuth role="driver">
              <DriverLayout><AvailableMissions /></DriverLayout>
            </RequireAuth>
          } />
          <Route path="/driver/active" element={
            <RequireAuth role="driver">
              <DriverLayout><ActiveMission /></DriverLayout>
            </RequireAuth>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Switch>
      </Router>
    </DataProvider>
  );
};

export default App;
