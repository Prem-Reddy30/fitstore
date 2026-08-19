import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
// We no longer import Firestore methods for users, as we are migrating data to Supabase
import { auth, googleProvider } from '../firebase/firebase';
import { supabase } from '../supabase/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch user profile and role from Supabase
        const { data: userDoc, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.uid)
          .single();
          
        if (userDoc && !error) {
          setProfile(userDoc);
          setRole(userDoc.role);
        } else {
          setProfile(null);
          setRole('customer'); // Default fallback
        }
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email, password, fullName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create Supabase record with role: "customer"
    await supabase.from('users').upsert({
      id: user.uid,
      name: fullName,
      email: email,
      role: 'customer'
    });
    
    return userCredential;
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get role from Supabase
    const { data: userDoc } = await supabase
      .from('users')
      .select('role')
      .eq('id', userCredential.user.uid)
      .single();
      
    let currentRole = 'customer';
    if (userDoc) {
      currentRole = userDoc.role;
    }
    return { userCredential, role: currentRole };
  };

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    
    // Check if user exists in Supabase
    const { data: userDoc } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.uid)
      .single();
    
    let currentRole = 'customer';
    if (!userDoc) {
      // If new user, create their document in Supabase
      await supabase.from('users').upsert({
        id: user.uid,
        name: user.displayName || 'Google User',
        email: user.email,
        role: 'customer'
      });
    } else {
      currentRole = userDoc.role;
    }
    
    return { userCredential, role: currentRole };
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    profile,
    role,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
