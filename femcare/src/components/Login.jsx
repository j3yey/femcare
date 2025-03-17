import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Attempt to sign in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Get user data from Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        console.log('Creating new user profile...');
        await setDoc(userDocRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          userType: 'patient', // Default to patient
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Also create a patient document
        const patientDocRef = doc(db, 'patients', userCredential.user.uid);
        await setDoc(patientDocRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          medicalHistory: [],
          appointments: [],
          personalInfo: {
            name: userCredential.user.displayName || '',
            dateOfBirth: '',
            phoneNumber: ''
          }
        
        });
        console.log('Created patient document:', userCredential.user.uid);

        // Redirect to dashboard after creating profile
        navigate('/patient-dashboard');
      } else {
        // User exists, get their data and redirect accordingly
        const userData = userDoc.data();
        if (userData?.userType === 'doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      }

    } catch (error) {
      console.error('Error logging in:', error);
      
      // Handle specific error cases
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email. Please register first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <h2>Login to FemCare+</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="form-footer">
          <button 
            type="button" 
            className="link-button"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </button>
          <button 
            type="button" 
            className="link-button"
            onClick={() => navigate('/register/patient')}
          >
            Don't have an account? Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;