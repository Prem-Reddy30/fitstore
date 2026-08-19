import { Dumbbell, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-gray-300 py-12 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4">
        {/* Top Section with 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div>
            <Link to="/" className="flex items-center gap-2 text-primary mb-4">
              <Dumbbell size={28} />
              <span className="text-2xl font-black tracking-tight text-white">FitStore</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Premium fitness equipment and apparel for athletes of all levels. Push your limits with the best gear.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Equipment</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Apparel</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">Supplements</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Size Guide</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                <span>123 Muscle Ave, FitCity, NY 10001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                <span>support@fitstore.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Section */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} FitStore. All rights reserved.</p>
          <Link to="/admin/login" className="hover:text-primary transition-colors flex items-center gap-1">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
