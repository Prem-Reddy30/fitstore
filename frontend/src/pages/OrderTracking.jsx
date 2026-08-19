import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, Package, Truck, CheckCircle, RefreshCcw, ShieldAlert, ArrowRight, Star } from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`*, order_items (quantity, price, product_id, products (name, image_url))`)
          .eq('id', id)
          .eq('user_id', user.uid)
          .single();
          
        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, user]);

  const handleOrderAction = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to request a ${newStatus.split('_')[0]}?`)) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);
        
      if (error) throw error;
      setOrder({ ...order, status: newStatus });
      alert(`Your request for a ${newStatus.split('_')[0]} has been submitted.`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h1 className="text-3xl font-black text-gray-900">Order Not Found</h1>
        <p className="text-gray-500">We couldn't find the order you're looking for.</p>
        <button onClick={() => navigate('/profile')} className="text-primary font-bold hover:underline">
          Go back to Profile
        </button>
      </div>
    );
  }

  // Determine progress bar state
  const statuses = ['processing', 'shipped', 'delivered'];
  let currentStep = statuses.indexOf(order.status);
  
  // Handle edge case statuses
  if (order.status === 'cancelled') currentStep = -1;
  if (order.status === 'refund_requested' || order.status === 'replacement_requested') currentStep = 2; // Treat as delivered for progress bar

  const isDelivered = currentStep === 2 || order.status === 'delivered' || order.status.includes('requested');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 min-h-[70vh]">
      <button 
        onClick={() => navigate('/profile')} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-bold transition-colors w-fit"
      >
        <ArrowLeft size={20} /> Back to Orders
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Order Details</h1>
          <p className="text-gray-500 mt-1 font-mono text-sm">Order #{order.id.split('-')[0]}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-sm mb-1">Order Placed</p>
          <p className="font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Tracking Bar */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-8">Delivery Status</h2>
        
        {order.status === 'cancelled' ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl flex items-center gap-4 border border-red-100">
            <ShieldAlert size={32} className="text-red-500" />
            <div>
              <h3 className="font-bold text-lg">Order Cancelled</h3>
              <p className="text-sm opacity-90">This order has been cancelled and will not be shipped.</p>
            </div>
          </div>
        ) : order.status === 'refund_requested' || order.status === 'replacement_requested' ? (
          <div className="bg-blue-50 text-blue-700 p-6 rounded-2xl flex items-center gap-4 border border-blue-100 mb-8">
            <RefreshCcw size={32} className="text-blue-500" />
            <div>
              <h3 className="font-bold text-lg capitalize">{order.status.replace('_', ' ')}</h3>
              <p className="text-sm opacity-90">We have received your request and our team is processing it. We will contact you soon.</p>
            </div>
          </div>
        ) : (
          <div className="relative max-w-3xl mx-auto mb-10">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${currentStep === 0 ? 0 : currentStep === 1 ? 50 : 100}%` }}
              ></div>
            </div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              
              {/* Ordered */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${currentStep >= 0 ? 'bg-primary text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-200 text-gray-400 border-4 border-white'}`}>
                  <Package size={20} />
                </div>
                <p className={`mt-3 font-bold text-sm ${currentStep >= 0 ? 'text-gray-900' : 'text-gray-400'}`}>Processing</p>
              </div>

              {/* Shipped */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${currentStep >= 1 ? 'bg-primary text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-200 text-gray-400 border-4 border-white'}`}>
                  <Truck size={20} />
                </div>
                <p className={`mt-3 font-bold text-sm ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Shipped</p>
              </div>

              {/* Delivered */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${currentStep >= 2 ? 'bg-primary text-white shadow-lg shadow-emerald-500/30' : 'bg-gray-200 text-gray-400 border-4 border-white'}`}>
                  <CheckCircle size={20} />
                </div>
                <p className={`mt-3 font-bold text-sm ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Delivered</p>
              </div>
              
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Items in this Order</h2>
          {order.order_items?.map((item, index) => {
            const product = item.products || {};
            return (
              <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-xl p-2 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                  {product.image_url || product.image ? (
                    <img src={product.image_url || product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <Package className="text-gray-300" size={40} />
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name || 'Unknown Product'}</h3>
                  <p className="text-gray-500 font-medium mb-4">Qty: {item.quantity} • ₹{Number(item.price).toFixed(2)}</p>
                  
                  {isDelivered && order.status === 'delivered' && (
                    <div className="flex flex-wrap items-center gap-3 mt-auto">
                      <a 
                        href={`/products/${item.product_id}#reviews`}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Star size={16} /> Write a Review
                      </a>
                      <button 
                        onClick={() => handleOrderAction('replacement_requested')}
                        disabled={actionLoading}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                      >
                        Replace Item
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">₹{Number(order.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-bold text-emerald-600">Free</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-gray-900">₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Global Actions */}
            <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
              {isDelivered && order.status === 'delivered' && (
                <>
                  <p className="text-sm text-gray-500 font-bold mb-3 uppercase tracking-wider">Need Help?</p>
                  <button 
                    onClick={() => handleOrderAction('refund_requested')}
                    disabled={actionLoading}
                    className="w-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
                  >
                    Request Full Refund <ArrowRight size={18} />
                  </button>
                  <p className="text-xs text-gray-400 mt-2 text-center">Refunds are subject to our 30-day return policy.</p>
                </>
              )}

              {order.status === 'processing' && (
                <button 
                  onClick={() => handleOrderAction('cancelled')}
                  disabled={actionLoading}
                  className="w-full bg-white border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center gap-2 shadow-sm"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default OrderTracking;
