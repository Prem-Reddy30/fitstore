import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';
import { CreditCard, CheckCircle, MapPin } from 'lucide-react';

const Checkout = () => {
  const { cart, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [upiApprovalPending, setUpiApprovalPending] = useState(false);
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    zipCode: ''
  });

  useEffect(() => {
    if (user?.uid) {
      const fetchAddresses = async () => {
        const { data } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false });
        if (data) {
          setSavedAddresses(data);
        }
      };
      fetchAddresses();
    }
  }, [user]);

  const handleAddressSelect = (e) => {
    const id = e.target.value;
    setSelectedAddressId(id);
    if (id) {
      const addr = savedAddresses.find(a => a.id === id);
      if (addr) {
        setFormData({
          fullName: addr.fullName,
          address: addr.street,
          city: addr.city,
          zipCode: addr.zipCode
        });
      }
    } else {
      setFormData({
        fullName: '',
        address: '',
        city: '',
        zipCode: ''
      });
    }
  };

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    
    if (paymentMethod === 'upi') {
      if (!upiId.trim()) {
        alert("Please enter a valid UPI ID.");
        setLoading(false);
        return;
      }
      setUpiApprovalPending(true);
      // Simulate waiting for user to open their UPI app and approve
      await new Promise(resolve => setTimeout(resolve, 5000));
      setUpiApprovalPending(false);
    }
    
    try {
      // 1. Create the Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.uid,
          total: total,
          status: 'processing'
        }])
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      const orderId = orderData.id;

      // 2. Create the Order Items
      const orderItemsToInsert = cart.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Success! Clear cart and show success screen
      clearCart();
      setSuccess(true);
      
    } catch (error) {
      console.error("Checkout failed: ", error);
      alert("Checkout failed: " + error.message);
    } finally {
      setLoading(false);
      setUpiApprovalPending(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-4xl font-black text-gray-900">Order Confirmed!</h1>
        <p className="text-gray-500 text-lg">Thank you for your purchase. Your gear is being prepared for shipment.</p>
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/profile" className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-emerald-600 transition-colors shadow-lg">
            View My Orders
          </Link>
          <Link to="/products" className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
        <h1 className="text-3xl font-black text-gray-900">Your cart is empty.</h1>
        <Link to="/products" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-emerald-600 transition-colors">
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
      
      {/* Checkout Form */}
      <div className="md:col-span-2 space-y-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-2xl font-black text-gray-900">Shipping Information</h2>
            
            {savedAddresses.length > 0 && (
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <select 
                  value={selectedAddressId}
                  onChange={handleAddressSelect}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 font-bold"
                >
                  <option value="">Use a saved address...</option>
                  {savedAddresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.fullName} - {addr.street}, {addr.city}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50" />
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
            Payment Information
          </h2>
          
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button 
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <CreditCard size={18} /> Credit Card
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${paymentMethod === 'upi' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              UPI Apps
            </button>
          </div>

          {paymentMethod === 'card' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name on Card</label>
                <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
                <div className="relative">
                  <input required type="text" placeholder="0000 0000 0000 0000" maxLength="19" className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50 font-mono tracking-widest" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                  <input required type="text" placeholder="MM/YY" maxLength="5" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">CVV</label>
                  <input required type="password" placeholder="•••" maxLength="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50 font-mono tracking-widest" />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-center gap-6 py-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center p-2 shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-gray-600">GPay</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[#5f259f] rounded-2xl flex items-center justify-center p-2 shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="w-full h-full object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600">PhonePe</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[#002970] rounded-2xl flex items-center justify-center p-2 shadow-sm">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="w-full h-full object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600">Paytm</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Enter UPI ID</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@upi" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-gray-50 font-medium" 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                    <CheckCircle size={20} className={upiId.includes('@') ? "opacity-100" : "opacity-0"} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">A payment request will be sent to this UPI ID.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div>
        <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 sticky top-24">
          <h2 className="text-xl font-black text-gray-900 mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                  <img src={item.image_url || item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="font-bold text-sm">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cartCount} items)</span>
              <span className="font-bold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-bold">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 pb-4 border-b border-gray-200">
              <span>Shipping</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-xl text-gray-900 pt-2">
              <span className="font-black">Total</span>
              <span className="font-black">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            type="submit" 
            form="checkout-form"
            disabled={loading}
            className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-black text-lg hover:bg-gray-800 transition-colors shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>

      {/* UPI Approval Overlay */}
      {upiApprovalPending && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-gray-50 rounded-full mx-auto flex items-center justify-center border-4 border-gray-100 relative">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0 m-auto"></div>
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Approve Payment</h3>
              <p className="text-gray-500 text-sm">
                Open your UPI app (GPay, PhonePe, Paytm) to approve the payment of <span className="font-bold text-gray-900">₹{total.toFixed(2)}</span>.
              </p>
            </div>
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Waiting for confirmation...
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
