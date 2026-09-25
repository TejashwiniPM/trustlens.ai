import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/error';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  authError: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile document
        const userDocRef = doc(db, 'users', currentUser.uid);
        const path = `users/${currentUser.uid}`;
        try {
          const snapshot = await getDoc(userDocRef);
          if (!snapshot.exists()) {
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Anonymous User',
              email: currentUser.email || '',
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          // If error occurs, route through handleFirestoreError
          try {
            handleFirestoreError(err, OperationType.WRITE, path, currentUser);
          } catch (e: any) {
            console.error('Error syncing user profile:', e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setAuthError(err?.message || 'Google sign-in could not be completed.');
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out failed:', err);
      setAuthError(err?.message || 'Sign-out failed.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
