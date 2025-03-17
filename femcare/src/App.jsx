import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useAuth } from './useAuth';
import Login from './components/Login';
import PatientRegister from './components/PatientRegister';

function App() {
  const { user, loading } = useAuth();

  // Add console logs for debugging
  console.log('Auth State:', { user, loading });

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <h1>FemCare+</h1> {/* Add this to verify basic rendering */}
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/patient" element={<PatientRegister />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;