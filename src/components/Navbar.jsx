import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, Search, Dumbbell, LogOut, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleMobileSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Mobile Menu Toggle & Logo Section */}
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden text-gray-700 hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
          <Link to="/" className="flex items-center gap-2 text-primary hover:text-emerald-700 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <Dumbbell size={28} />
            <span className="text-2xl font-black tracking-tight hidden sm:block md:block">FitStore</span>
          </Link>
        </div>

        {/* Center Links (Hidden on mobile) */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 font-medium text-gray-700">
          <Link to="/" className={`hover:text-primary transition-colors ${location.pathname === '/' ? 'text-primary font-bold' : ''}`}>Home</Link>
          <Link to="/products?category=Equipment" className="hover:text-primary transition-colors">Equipment</Link>
          <Link to="/products?category=Apparel" className="hover:text-primary transition-colors">Apparel</Link>
          <Link to="/products?category=Supplements" className="hover:text-primary transition-colors">Supplements</Link>
          <Link to="/products?category=Accessories" className="hover:text-primary transition-colors">Accessories</Link>
        </div>

        {/* Search Bar (Hidden on mobile) */}
        <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64">
          <Search size={18} className="text-gray-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search store..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleMobileSearch}
            className="bg-transparent border-none outline-none w-full text-sm font-medium"
          />
        </div>

        {/* Icons Section */}
        <div className="flex items-center gap-3 sm:gap-4 text-gray-700">
          <Link to="/wishlist" className="hover:text-primary transition-colors relative p-1">
            <Heart size={24} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="hover:text-primary transition-colors relative p-1">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3 ml-1 sm:ml-2 group relative">
              <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="text-sm font-bold hidden lg:block text-gray-800">
                  {profile?.name?.split(' ')[0] || 'User'}
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors ml-1 p-1 rounded-md hover:bg-red-50 hidden sm:block"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 hover:text-primary transition-colors ml-1 sm:ml-2 bg-gray-50 hover:bg-primary/10 px-2 sm:px-3 py-1.5 rounded-lg">
              <User size={20} />
              <span className="text-sm font-bold hidden sm:block">Login</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-xl">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 w-full">
              <Search size={18} className="text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Search store..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleMobileSearch}
                className="bg-transparent border-none outline-none w-full text-sm font-medium"
              />
            </div>
            
            {/* Mobile Links */}
            <div className="flex flex-col space-y-2 pb-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`py-3 font-bold ${location.pathname === '/' ? 'text-primary' : 'text-gray-700'}`}>Home</Link>
              <Link to="/products?category=Equipment" onClick={() => setIsMobileMenuOpen(false)} className="py-3 font-bold text-gray-700 border-t border-gray-50">Equipment</Link>
              <Link to="/products?category=Apparel" onClick={() => setIsMobileMenuOpen(false)} className="py-3 font-bold text-gray-700 border-t border-gray-50">Apparel</Link>
              <Link to="/products?category=Supplements" onClick={() => setIsMobileMenuOpen(false)} className="py-3 font-bold text-gray-700 border-t border-gray-50">Supplements</Link>
              <Link to="/products?category=Accessories" onClick={() => setIsMobileMenuOpen(false)} className="py-3 font-bold text-gray-700 border-t border-gray-50">Accessories</Link>
              
              {user && (
                <button onClick={handleLogout} className="py-3 font-bold text-red-500 flex items-center gap-2 border-t border-gray-50">
                  <LogOut size={18} /> Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
