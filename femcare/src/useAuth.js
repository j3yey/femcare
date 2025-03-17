import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // Combine Firebase auth user and Firestore data
            setUser({
              ...firebaseUser,
              ...userDoc.data()
            });
          } else {
            // Handle case where user exists in Auth but not in Firestore
            console.warn('User document not found in Firestore');
            setUser(firebaseUser);
          }
        } else {
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