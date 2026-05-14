import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider }  from './hooks/useAuth';
import ProtectedRoute    from './components/layout/ProtectedRoute';
import Dashboard         from './pages/dashboard/Dashboard';
import Login             from './pages/auth/Login';
import Signup            from './pages/auth/Signup';

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"  element={<Login />}  />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Default redirect */}
          <Route path="/"  element={<Navigate to="/login"     replace />} />
          <Route path="*"  element={<Navigate to="/login"     replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
