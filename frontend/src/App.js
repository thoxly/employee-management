import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuthContext } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LocationsPage from './pages/LocationsPage';
import TasksPage from './pages/TasksPage';
import EmployeesPage from './pages/EmployeesPage';
import TrackerPage from './pages/TrackerPage';
import ReportsPage from './pages/ReportsPage';
import MyAppContainer from './pages/my-app-pages/MyAppContainer';

import SettingsPage from './pages/my-app-pages/SettingsPage';
import TelegramAuthWrapper from './components/TelegramAuthWrapper';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();
  
  console.log('ProtectedRoute:', { isAuthenticated, loading });
  
  if (loading) {
    console.log('ProtectedRoute: Showing loading spinner');
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to login');
    return <Navigate to="/login" />;
  }
  
  console.log('ProtectedRoute: Rendering children');
  return children;
};

// Web App Routes
const WebAppRoutes = () => {
  console.log('WebAppRoutes: Rendering');
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Navigate to="tasks" replace />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/tasks" element={
        <ProtectedRoute>
          <Layout>
            <TasksPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/employees" element={
        <ProtectedRoute>
          <Layout>
            <EmployeesPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/my-locations" element={
        <ProtectedRoute>
          <Layout>
            <LocationsPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/tracker" element={
        <ProtectedRoute>
          <Layout>
            <TrackerPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/dashboard/reports" element={
        <ProtectedRoute>
          <Layout>
            <ReportsPage />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Mini App Routes
const MiniAppRoutes = () => {
  console.log('MiniAppRoutes: Rendering');
  return (
    <TelegramAuthWrapper>
      <Routes>
        <Route index element={<MyAppContainer />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </TelegramAuthWrapper>
  );
};

function App() {
  console.log('App: Rendering');

  return (
    <Router>
      <Routes>
        {/* Маршруты для мини-приложения */}
        <Route path="/my-app/*" element={<MiniAppRoutes />} />
        
        {/* Маршруты для веб-приложения */}
        <Route path="/*" element={<WebAppRoutes />} />
      </Routes>
    </Router>
  );
}

export default App; 