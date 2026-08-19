import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Loader2 } from 'lucide-react';
import { supabase } from '../supabase/supabaseClient';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartCount } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate discount based on eligible items
  let discountAmount = 0;
  if (appliedCoupon) {
    const eligibleSubtotal = cart
      .filter(item => item.category === appliedCoupon.categories?.name)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
    discountAmount = eligibleSubtotal * (appliedCoupon.discount_percentage / 100);
  }

  const tax = (subtotal - discountAmount) * 0.08;
  const total = (subtotal - discountAmount) + tax;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplying(true);
    setCouponError('');
    
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*, categories(name)')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();
        
      if (error || !data) {
        setCouponError('Invalid or expired coupon code.');
        setAppliedCoupon(null);
        return;
      }

      // Check if cart has items from this category
      const hasEligibleItem = cart.some(item => item.category === data.categories?.name);
      
      if (!hasEligibleItem) {
        setCouponError(`This coupon is only valid for ${data.categories?.name} products.`);
        setAppliedCoupon(null);
        return;
      }

      // Simulate a small delay for the animation to be visible
      await new Promise(resolve => setTimeout(resolve, 600));

      setAppliedCoupon(data);
      setCouponCode('');
    } catch (err) {
      console.error(err);
      setCouponError('Failed to apply coupon.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-4xl font-black text-gray-900">Your cart is empty</h1>
        <p className="text-gray-500 text-lg">Looks like you haven't added anything to your cart yet.</p>
        <div className="pt-4">
          <Link to="/products" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-emerald-600 transition-colors shadow-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 py-8">
      
      {/* Cart Items List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-end mb-6">
          <h1 className="text-3xl font-black text-gray-900">Your Cart</h1>
          <span className="text-gray-500 font-bold">{cartCount} Items</span>
        </div>
        
        {cart.map(item => (
          <div key={item.id} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group">
            
            {/* Image */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 p-2">
              <img 
                src={item.image_url || item.image} 
                alt={item.name} 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col w-full sm:w-auto">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{item.name}</h3>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">
                    {item.category}
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-black text-xl text-gray-900">₹{item.price}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-6 w-full">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                >
                  <Trash2 size={18} />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary Sticky Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 sticky top-24">
          <h2 className="text-xl font-black text-gray-900 mb-6">Order Summary</h2>
          
          <div className="space-y-4 text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            
            {appliedCoupon && (
              <div className="flex justify-between text-emerald-600 animate-fade-in-up">
                <span className="flex items-center gap-1">
                  <Tag size={16} /> Discount ({appliedCoupon.code})
                </span>
                <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-bold text-gray-900">₹{Math.max(0, tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between items-end">
              <span className="font-bold text-gray-900">Total</span>
              <div className="text-right">
                <span className="block text-3xl font-black text-gray-900">₹{Math.max(0, total).toFixed(2)}</span>
                <span className="text-xs text-gray-500">Including all taxes</span>
              </div>
            </div>
          </div>
          
          {/* Coupon Section */}
          <div className="mb-8 border-t border-gray-200 pt-6">
            {appliedCoupon ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex justify-between items-center transition-all animate-fade-in-up">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Tag size={18} />
                  <span className="font-bold">{appliedCoupon.code} applied!</span>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Have a coupon code?</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={isApplying || !couponCode.trim()}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center min-w-[80px] overflow-hidden"
                  >
                    {isApplying ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500 font-bold animate-fade-in-up">{couponError}</p>}
              </form>
            )}
          </div>

          <Link 
            to="/checkout"
            className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-600 transition-colors shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] flex justify-center items-center gap-2 group"
          >
            Proceed to Checkout
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Secure Checkout powered by FitStore</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
