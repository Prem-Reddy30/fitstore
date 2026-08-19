import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';

const AdminRoute = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You are trying to access the Admin Dashboard, but you don't have the required permissions.</p>
          
          <div className="bg-gray-50 p-4 rounded-lg text-left text-sm font-mono mb-6 border border-gray-200">
            <p className="mb-2"><span className="text-gray-500">Your Current Role:</span> <span className="text-red-600 font-bold">"{role}"</span></p>
            <p className="mb-2"><span className="text-gray-500">Expected Role:</span> <span className="text-green-600 font-bold">"admin"</span></p>
            <p><span className="text-gray-500">Your User UID:</span> {user.uid}</p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            To fix this, go to your Supabase Dashboard ➔ Table Editor ➔ 'users' table ➔ Find the row with the UID above, and change the 'role' field to exactly <strong>admin</strong> (all lowercase).
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('users')
                    .upsert({ 
                      id: user.uid,
                      email: user.email,
                      name: user.displayName || 'Admin User',
                      role: 'admin' 
                    });
                    
                  if (error) throw error;
                  
                  window.location.reload();
                } catch (err) {
                  alert("Failed to upgrade: " + err.message);
                }
              }}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors"
            >
              🚀 Upgrade Me To Admin Automatically!
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
