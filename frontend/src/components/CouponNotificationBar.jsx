import { useState, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import { supabase } from '../supabase/supabaseClient';

const CouponNotificationBar = () => {
  const [coupons, setCoupons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*, categories(name)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setCoupons(data);
        }
      } catch (err) {
        console.error("Error fetching coupons:", err);
      }
    };
    
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (coupons.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % coupons.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [coupons.length]);

  if (!isVisible || coupons.length === 0) return null;

  const currentCoupon = coupons[currentIndex];

  return (
    <div className="bg-primary text-white py-2 px-4 relative overflow-hidden transition-all duration-300">
      <div className="container mx-auto flex items-center justify-center text-sm font-bold animate-fade-in-up">
        <Tag size={16} className="mr-2 animate-bounce" />
        <p>
          Special Offer: Get <span className="text-yellow-300 mx-1">{currentCoupon.discount_percentage}% OFF</span> 
          on {currentCoupon.categories?.name} with code <span className="bg-black/20 px-2 py-0.5 rounded ml-1 tracking-wider">{currentCoupon.code}</span>
        </p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default CouponNotificationBar;
