import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../supabase/supabaseClient';

// Global cache for coupons to prevent excessive fetching
let cachedCoupons = null;
let couponsPromise = null;

const ProductCard = ({ product, dark = false }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [categoryCoupon, setCategoryCoupon] = useState(null);
  
  const isFavorited = isInWishlist(product.id);

  useEffect(() => {
    const getCoupons = async () => {
      if (cachedCoupons) {
        findCoupon(cachedCoupons);
        return;
      }
      if (!couponsPromise) {
        couponsPromise = supabase
          .from('coupons')
          .select('*, categories(name)')
          .eq('is_active', true);
      }
      try {
        const { data } = await couponsPromise;
        cachedCoupons = data;
        findCoupon(data);
      } catch (err) {
        console.error("Failed to load coupons", err);
      }
    };
    
    const findCoupon = (coupons) => {
      if (!coupons) return;
      const match = coupons.find(c => c.categories?.name === product.category);
      if (match) setCategoryCoupon(match);
    };

    getCoupons();
  }, [product.category]);

  return (
    <div className={`rounded-2xl shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group ${dark ? 'bg-gray-800 border-gray-700 shadow-black/50' : 'bg-white border-gray-100'}`}>
      <div className="relative">
        <Link to={`/products/${product.id}`} className="block relative h-64 overflow-hidden bg-gray-100">
        <img 
          src={product.image_url || product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Quick Add Button Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
          <button 
            onClick={(e) => {
              e.preventDefault(); // Prevent navigating to product page
              addToCart(product);
            }}
            className="bg-primary text-white font-bold py-2 px-6 rounded-full w-full flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg"
          >
            <ShoppingCart size={18} /> Quick Add
          </button>
        </div>
      </Link>
      </div>
      
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="text-xs text-primary font-bold uppercase tracking-wider">{product.category}</div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart size={20} className={isFavorited ? "fill-red-500 text-red-500" : ""} />
          </button>
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className={`font-black mb-2 truncate transition-colors ${dark ? 'text-white hover:text-primary' : 'text-gray-900 hover:text-primary'}`}>{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 text-yellow-400 mb-4 text-sm font-bold">
          <Star size={16} fill="currentColor" />
          <span className={dark ? 'text-gray-400' : 'text-gray-600'}>{product.rating}</span>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <span className={`text-2xl font-black ${dark ? 'text-white' : 'text-gray-900'}`}>₹{product.price}</span>
        </div>
        
        {categoryCoupon && (
          <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center gap-2 animate-fade-in-up">
            <div className="bg-emerald-100 p-1.5 rounded-md text-emerald-600">
              <Tag size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Special Offer</p>
              <p className="text-xs font-bold text-gray-800 truncate">
                Use code <span className="text-emerald-700 bg-emerald-100/50 px-1 rounded">{categoryCoupon.code}</span> for {categoryCoupon.discount_percentage}% off
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
