import React, { useState, useEffect } from 'react'; // Add useEffect import here
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import Login from './components/Login';
import PatientRegister from './components/PatientRegister';
import PatientDashboard from './components/PatientDashboard';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : null;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <h1>FemCare+</h1>
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/patient-dashboard" /> : <Navigate to="/login" />} 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register/patient" element={<PatientRegister />} />
          <Route 
            path="/patient-dashboard" 
            element={
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;