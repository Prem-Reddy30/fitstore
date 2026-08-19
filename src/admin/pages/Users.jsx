import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import { User, Shield, ShieldAlert, Trash2, Mail, Calendar } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users: ", error);
      alert("Error fetching users. Ensure Supabase keys are in .env");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update a user's role in Supabase
  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (window.confirm(`Are you sure you want to change this user to ${newRole}?`)) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ role: newRole })
          .eq('id', userId);
          
        if (error) throw error;
        
        // Update local state to reflect change immediately
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      } catch (error) {
        alert("Failed to update role in Supabase.");
        console.error(error);
      }
    }
  };

  // Delete a user (from Supabase only)
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user profile? This cannot be undone.")) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
          
        if (error) throw error;
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        alert("Failed to delete user profile from Supabase.");
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-900">Users Management</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-gray-600 border border-gray-100">
          Total Users: <span className="text-primary">{users.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
              <tr>
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Contact</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                      Loading users from database...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name || 'Anonymous User'}</p>
                          <p className="text-xs text-gray-500 font-mono">{user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} />
                        {user.email || 'No email provided'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role === 'admin' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                        {user.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown Date'}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleRoleChange(user.id, user.role)}
                          className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          title="Toggle Role"
                        >
                          Make {user.role === 'admin' ? 'Customer' : 'Admin'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User Profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
