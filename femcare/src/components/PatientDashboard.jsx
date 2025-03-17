import React, { useState, useEffect } from 'react';
import { useAuth } from '../useAuth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

// Import UserType enum if you're using JavaScript
const UserType = {
  PATIENT: 'patient',
  DOCTOR: 'doctor'
};

const PatientDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      console.log('PatientDashboard: Auth state', { user, authLoading });
      
      if (authLoading) {
        console.log('PatientDashboard: Still loading auth...');
        return;
      }

      if (!user) {
        console.log('PatientDashboard: No user found, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        console.log('PatientDashboard: Fetching patient data for', user.uid);
        const patientDocRef = doc(db, 'patients', user.uid);
        const patientDoc = await getDoc(patientDocRef);
        
        if (patientDoc.exists()) {
          const data = patientDoc.data();
          console.log('PatientDashboard: Found patient data', data);
          
          if (data.uid === user.uid) {
            // Create a normalized version of the patient data
            const normalizedData = {
              ...data,
              id: patientDoc.id,
              fullName: data.fullName || user.fullName || user.email,
              dateOfBirth: data.dateOfBirth || '',
              phoneNumber: data.phoneNumber || '',
              medicalHistory: data.medicalHistory || '',
              appointments: data.appointments || []
            };
            
            // Update the document if it's missing any fields
            if (JSON.stringify(data) !== JSON.stringify(normalizedData)) {
              await setDoc(patientDocRef, {
                ...normalizedData,
                updatedAt: serverTimestamp()
              }, { merge: true });
              console.log('PatientDashboard: Updated patient document with missing fields');
            }
            
            setPatientData(normalizedData);
          } else {
            setError('Unauthorized access');
            navigate('/login');
          }
        } else {
          console.log('PatientDashboard: No patient document found');
          setError('No patient data found');
        }
      } catch (err) {
        console.error('PatientDashboard: Error fetching data', err);
        setError('Error fetching patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return <div className="loading">Authenticating...</div>;
  }

  if (loading && user) {
    return <div className="loading">Loading patient data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user || !patientData) {
    return <div className="unauthorized">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="patient-dashboard">
      <h2>Welcome, {patientData.fullName}</h2>
      
      <div className="dashboard-content">
        <div className="patient-info">
          <h3>Your Profile</h3>
          <div className="info-card">
            <p><strong>Email:</strong> {patientData.email}</p>
            <p><strong>Full Name:</strong> {patientData.fullName}</p>
            <p><strong>Date of Birth:</strong> {patientData.dateOfBirth || 'Not set'}</p>
            <p><strong>Phone Number:</strong> {patientData.phoneNumber || 'Not set'}</p>
          </div>
        </div>

        <div className="medical-history">
          <h3>Medical History</h3>
          <div className="medical-history-content">
            {patientData.medicalHistory ? (
              <p>{patientData.medicalHistory}</p>
            ) : (
              <p>No medical history available</p>
            )}
          </div>
        </div>

        <div className="appointments-section">
          <h3>Your Appointments</h3>
          <div className="appointments-list">
            {patientData.appointments && patientData.appointments.length > 0 ? (
              patientData.appointments.map((appointment, index) => (
                <div key={index} className="appointment-card">
                  <h4>Appointment {index + 1}</h4>
                  <p><strong>Date:</strong> {appointment.date}</p>
                  <p><strong>Status:</strong> {appointment.status}</p>
                  {appointment.notes && (
                    <p><strong>Notes:</strong> {appointment.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <p>No appointments scheduled</p>
            )}
          </div>
        </div>
      </div>

      {/* Debug section */}
      <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h4>Debug Information</h4>
        <p>User ID: {user.uid}</p>
        <p>User Email: {user.email}</p>
        <p>User Type: {user.userType}</p>
        <div>
          <h5>Patient Data:</h5>
          <pre>{JSON.stringify(patientData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;