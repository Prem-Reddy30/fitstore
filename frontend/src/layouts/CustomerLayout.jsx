import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CouponNotificationBar from '../components/CouponNotificationBar';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <CouponNotificationBar />
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <Footer />
      
    </div>
  );
};

export default CustomerLayout;
