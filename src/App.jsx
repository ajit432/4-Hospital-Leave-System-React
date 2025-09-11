import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import DoctorsList from './pages/DoctorsList';
import AdminLeaves from './pages/AdminLeaves';
import AdminDashboard from './pages/AdminDashboard';
import AdminLeaveAllocation from './pages/AdminLeaveAllocation';
import Settings from './pages/Settings';

const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><RoleBasedRedirect /></ProtectedRoute>} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['doctor']}>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/leave/apply" element={
              <ProtectedRoute roles={['doctor']}>
                <DashboardLayout>
                  <ApplyLeave />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/leave/history" element={
              <ProtectedRoute roles={['doctor']}>
                <DashboardLayout>
                  <LeaveHistory />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/doctors" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <DoctorsList />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/leaves" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminLeaves />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/leave-allocation" element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <AdminLeaveAllocation />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Catch all route - redirect based on role */}
            <Route path="*" element={
              <ProtectedRoute>
                <RoleBasedRedirect />
              </ProtectedRoute>
            } />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={theme}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
