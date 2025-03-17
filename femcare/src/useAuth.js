import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Import the UserType enum if you're using JavaScript
const UserType = {
  PATIENT: 'patient',
  DOCTOR: 'doctor'
};

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('useAuth: Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('useAuth: Auth state changed', firebaseUser);
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          console.log('useAuth: Fetched user doc', userDoc.exists());
          
          if (!userDoc.exists()) {
            // Create default user document if it doesn't exist
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              userType: UserType.PATIENT,
              fullName: firebaseUser.displayName || '',
              phoneNumber: '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            
            await setDoc(userDocRef, userData);
            console.log('useAuth: Created new user doc');
            
            // Create patient document with the correct structure
            const patientDocRef = doc(db, 'patients', firebaseUser.uid);
            await setDoc(patientDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              userType: UserType.PATIENT,
              fullName: firebaseUser.displayName || '',
              phoneNumber: '',
              dateOfBirth: '',
              medicalHistory: '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            console.log('useAuth: Created new patient doc');

            // Set user with the new data
            setUser({
              ...firebaseUser,
              ...userData
            });
          } else {
            // User exists in Firestore, combine the data
            const userData = userDoc.data();
            console.log('useAuth: Using existing user data', userData);
            
            // Ensure all required fields are present
            const updatedUserData = {
              ...userData,
              fullName: userData.fullName || firebaseUser.displayName || '',
              phoneNumber: userData.phoneNumber || '',
              updatedAt: serverTimestamp()
            };

            // Update the user document if needed
            if (JSON.stringify(userData) !== JSON.stringify(updatedUserData)) {
              await setDoc(userDocRef, updatedUserData, { merge: true });
              console.log('useAuth: Updated user doc with missing fields');
            }

            setUser({
              ...firebaseUser,
              ...updatedUserData
            });

            // Check and update patient document if user is a patient
            if (userData.userType === UserType.PATIENT) {
              const patientDocRef = doc(db, 'patients', firebaseUser.uid);
              const patientDoc = await getDoc(patientDocRef);

              if (!patientDoc.exists()) {
                // Create patient document if it doesn't exist
                await setDoc(patientDocRef, {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  userType: UserType.PATIENT,
                  fullName: updatedUserData.fullName,
                  phoneNumber: updatedUserData.phoneNumber,
                  dateOfBirth: '',
                  medicalHistory: '',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                });
                console.log('useAuth: Created missing patient doc for existing user');
              }
            }
          }
        } else {
          console.log('useAuth: No firebase user');
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
};