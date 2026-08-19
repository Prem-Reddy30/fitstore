import { Menu, Search, Bell, UserCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-30">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors"
        >
          <Menu size={24} />
        </button>
        
        {/* Admin Global Search */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-64 lg:w-96">
          <Search size={18} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search orders, products..." 
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-primary transition-colors">
          <Bell size={20} />
        </button>
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors group"
          title="Logout"
        >
          <UserCircle size={28} className="group-hover:hidden" />
          <LogOut size={28} className="hidden group-hover:block" />
          <span className="text-sm font-bold hidden sm:block group-hover:text-red-500">Admin</span>
        </button>
      </div>
      
    </header>
  );
};

export default AdminHeader;
