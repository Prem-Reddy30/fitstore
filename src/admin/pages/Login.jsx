import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { supabase } from '../../supabase/supabaseClient';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let userCredential;
      try {
        // 1. Authenticate with Firebase
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (loginError) {
        // Auto-create the admin account ONLY if they are trying the default admin email and it doesn't exist yet
        if (email === 'admin@fitstore.com' && (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential')) {
           const { createUserWithEmailAndPassword } = await import('firebase/auth');
           userCredential = await createUserWithEmailAndPassword(auth, email, password);
           
           // Ensure they get the admin role in Supabase immediately
           await supabase.from('users').upsert({
             id: userCredential.user.uid,
             name: 'Super Admin',
             email: email,
             role: 'admin'
           });
        } else {
           throw loginError;
        }
      }
      
      // 2. Check role in Supabase
      const { data: userDoc, error: supabaseError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userCredential.user.uid)
        .single();
        
      if (supabaseError || !userDoc || userDoc.role !== 'admin') {
        // If not admin, sign them out immediately
        await signOut(auth);
        throw new Error('Unauthorized Access. You must be an administrator to log in here.');
      }

      // Navigate to admin dashboard and force reload to ensure role propagates across contexts
      navigate('/admin');
      window.location.reload();
      
    } catch (err) {
      console.error("Admin login failed:", err);
      // Clean up firebase error messages
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError('Invalid email or password.');
      } else {
         setError(err.message || 'Failed to authenticate admin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full z-10 animate-fade-in-up">
        
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 transform rotate-3">
            <ShieldCheck size={40} className="text-white transform -rotate-3" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-gray-400">Secure access for store managers</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail size={20} className="text-gray-400" />
            </div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Sign In 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Return to <a href="/" className="text-emerald-400 hover:underline">Storefront</a>
        </p>

      </div>
    </div>
  );
};

export default AdminLogin;
