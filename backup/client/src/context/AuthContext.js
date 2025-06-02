import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('../config/firebase');

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // User is signed in
            const userData = {
              id: user.uid,
              email: user.email,
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ')[1] || '',
              displayName: user.displayName
            };
            setUser(userData);

            // Store Firebase ID token
            try {
              const token = await user.getIdToken();
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
              console.error('Error getting ID token:', error);
            }
          } else {
            // User is signed out
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email);

      // Use Firebase Auth directly for demo
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../config/firebase');

      console.log('Firebase auth object:', auth);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Login successful, user:', user);

      // Set user data
      const userData = {
        id: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        displayName: user.displayName
      };

      setUser(userData);
      toast.success('Login successful!');
      return { success: true, data: userData };
    } catch (error) {
      console.error('Login error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      let message = 'Login failed';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/user-disabled') {
        message = 'This account has been disabled';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later';
      } else {
        message = error.message || 'Login failed';
      }

      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      // Use Firebase Auth directly for demo
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { auth } = await import('../config/firebase');

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      toast.success('Registration successful!');
      return { success: true, data: userCredential.user };
    } catch (error) {
      const message = error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../config/firebase');

      await signOut(auth);
      Cookies.remove('token');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const verifyEmail = async (token) => {
    try {
      // For demo purposes, just show success message
      toast.success('Email verified successfully! You can now log in.');
      return { success: true };
    } catch (error) {
      const message = 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      // Use Firebase Auth for password reset
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('../config/firebase');

      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset link sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      // For demo purposes, just show success message
      toast.success('Password reset successfully! You can now log in.');
      return { success: true };
    } catch (error) {
      const message = 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Use Firebase Auth to update profile
      const { updateProfile: firebaseUpdateProfile } = await import('firebase/auth');
      const { auth } = await import('../config/firebase');

      const currentUser = auth.currentUser;
      if (currentUser) {
        await firebaseUpdateProfile(currentUser, {
          displayName: `${profileData.firstName} ${profileData.lastName}`
        });

        // Update local user state
        const updatedUser = {
          ...user,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          displayName: `${profileData.firstName} ${profileData.lastName}`
        };
        setUser(updatedUser);

        toast.success('Profile updated successfully');
        return { success: true, data: updatedUser };
      } else {
        throw new Error('No user logged in');
      }
    } catch (error) {
      const message = error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
