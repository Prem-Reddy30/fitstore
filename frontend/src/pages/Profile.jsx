import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase/supabaseClient';
import { User, Package, RefreshCw, Settings, MapPin, CreditCard, ChevronRight, LogOut, Bell, Dumbbell, ShoppingBag, Plus, Trash2, Star } from 'lucide-react';

const Profile = () => {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  
  // Data States
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [addressForm, setAddressForm] = useState({ fullName: '', street: '', city: '', zipCode: '' });
  const [paymentForm, setPaymentForm] = useState({ cardName: '', cardNumber: '', expiry: '' });
  const [notifications, setNotifications] = useState({ orderUpdates: true, promotions: false, newsletter: false });
  
  // UI States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({ name: profile.name || '', phone: profile.phone || '' });
      if (profile.notifications) {
        setNotifications(profile.notifications);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Orders
        const { data: ordersData } = await supabase
          .from('orders')
          .select(`*, order_items (quantity, price, product_id, products (name, image_url))`)
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false });
        if (ordersData) setOrders(ordersData);

        // Fetch Addresses
        const { data: addrData } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false });
        if (addrData) setAddresses(addrData);

        // Fetch Payments
        const { data: payData } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.uid)
          .order('created_at', { ascending: false });
        if (payData) setPayments(payData);

      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeTab]); // Re-fetch occasionally or on tab switch

  const handleProfileSave = async () => {
    try {
      const { error } = await supabase.from('users').update({
        name: profileForm.name,
        phone: profileForm.phone
      }).eq('id', user.uid);
      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('addresses').insert([{
        user_id: user.uid,
        ...addressForm
      }]).select();
      if (error) throw error;
      setAddresses([data[0], ...addresses]);
      setShowAddressForm(false);
      setAddressForm({ fullName: '', street: '', city: '', zipCode: '' });
    } catch (err) {
      alert("Failed to add address: " + err.message);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await supabase.from('addresses').delete().eq('id', id);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      // Mask card number for display
      const masked = '**** **** **** ' + paymentForm.cardNumber.slice(-4);
      const { data, error } = await supabase.from('payment_methods').insert([{
        user_id: user.uid,
        cardName: paymentForm.cardName,
        cardNumber: masked,
        expiry: paymentForm.expiry
      }]).select();
      if (error) throw error;
      setPayments([data[0], ...payments]);
      setShowPaymentForm(false);
      setPaymentForm({ cardName: '', cardNumber: '', expiry: '' });
    } catch (err) {
      alert("Failed to add card: " + err.message);
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      await supabase.from('payment_methods').delete().eq('id', id);
      setPayments(payments.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationChange = async (key) => {
    const newPrefs = { ...notifications, [key]: !notifications[key] };
    setNotifications(newPrefs);
    try {
      await supabase.from('users').update({ notifications: newPrefs }).eq('id', user.uid);
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { id: 'orders', label: 'My Orders', icon: <Package size={20} /> },
    { id: 'returns', label: 'Returns & Refunds', icon: <RefreshCw size={20} /> },
    { id: 'addresses', label: 'Saved Addresses', icon: <MapPin size={20} /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 min-h-[70vh]">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">My Account</h1>
        <p className="text-gray-500 mt-1">Welcome back, {profile?.name || 'User'}!</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1">{profile?.name || 'Customer'}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{user?.email}</p>
              </div>
            </div>
            
            <nav className="p-2 flex overflow-x-auto lg:flex-col gap-2 scrollbar-hide">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 lg:w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    activeTab === item.id 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'text-gray-600 hover:bg-gray-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 lg:gap-3">
                    {item.icon}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className={`hidden lg:block ${activeTab === item.id ? 'text-primary' : 'text-gray-400'}`} />
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => logout()}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-bold"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="w-full lg:w-3/4">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <ShoppingBag size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No orders placed yet</h3>
                  <p className="text-gray-500 mb-4 text-sm">When you buy products, your orders will appear here.</p>
                  <button onClick={() => window.location.href = '/products'} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 font-medium">Order Placed</p>
                          <p className="font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Total</p>
                          <p className="font-bold text-gray-900">₹{Number(order.total).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Order #</p>
                          <p className="font-bold text-gray-900 font-mono text-xs">{order.id.split('-')[0]}</p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Map through items in the order */}
                      <div className="divide-y divide-gray-100">
                        {order.order_items?.map((item, index) => {
                          const product = item.products || {};
                          return (
                            <div key={index} className="p-6 flex flex-col md:flex-row gap-6 items-center">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                              ) : (
                                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                                  <Dumbbell className="text-gray-400" size={32} />
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <h4 className="font-bold text-lg text-gray-900">{product.name || 'Unknown Product'}</h4>
                                <p className="text-gray-500 text-sm mt-1">Qty: {item.quantity} • ₹{Number(item.price).toFixed(2)}</p>
                              </div>
                              <div className="flex flex-col gap-2 w-full md:w-auto">
                                <Link to={`/profile/orders/${order.id}`} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm text-center flex items-center justify-center gap-2">
                                  <Package size={16} /> Track Package
                                </Link>
                                {order.status === 'delivered' && (
                                  <Link to={`/products/${item.product_id}#reviews`} className="px-6 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-sm text-center border border-yellow-500 flex items-center justify-center gap-2">
                                    <Star size={16} /> Rate this Product
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* RETURNS TAB */}
          {activeTab === 'returns' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
              <RefreshCw size={64} className="text-gray-200 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Returns</h2>
              <p className="text-gray-500 max-w-md">You haven't requested any returns or refunds recently. If you need to return an item, go to your Orders page.</p>
              <button onClick={() => setActiveTab('orders')} className="mt-6 px-6 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors">
                View Orders
              </button>
            </div>
          )}



          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                {!showAddressForm && (
                  <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-2 text-primary font-bold hover:text-emerald-700">
                    <Plus size={20} /> Add New
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input required type="text" value={addressForm.fullName} onChange={e => setAddressForm({...addressForm, fullName: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                      <input required type="text" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                      <input required type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                      <input required type="text" value={addressForm.zipCode} onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-emerald-600">Save Address</button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">Cancel</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.length === 0 && !showAddressForm && (
                  <p className="text-gray-500 col-span-2">No addresses saved yet.</p>
                )}
                {addresses.map(addr => (
                  <div key={addr.id} className="border border-gray-200 rounded-xl p-5 relative">
                    <button onClick={() => handleDeleteAddress(addr.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                    <h3 className="font-bold text-gray-900 mb-2">{addr.fullName}</h3>
                    <p className="text-gray-600 text-sm">{addr.street}</p>
                    <p className="text-gray-600 text-sm">{addr.city}, {addr.zipCode}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAYMENT TAB */}
          {activeTab === 'payment' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
                {!showPaymentForm && (
                  <button onClick={() => setShowPaymentForm(true)} className="flex items-center gap-2 text-primary font-bold hover:text-emerald-700">
                    <Plus size={20} /> Add Card
                  </button>
                )}
              </div>

              {showPaymentForm && (
                <form onSubmit={handlePaymentSubmit} className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Name on Card</label>
                      <input required type="text" value={paymentForm.cardName} onChange={e => setPaymentForm({...paymentForm, cardName: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Card Number (Mock)</label>
                      <input required type="text" placeholder="XXXX XXXX XXXX XXXX" value={paymentForm.cardNumber} onChange={e => setPaymentForm({...paymentForm, cardNumber: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Expiry (MM/YY)</label>
                      <input required type="text" placeholder="12/25" value={paymentForm.expiry} onChange={e => setPaymentForm({...paymentForm, expiry: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800">Save Card</button>
                    <button type="button" onClick={() => setShowPaymentForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">Cancel</button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {payments.length === 0 && !showPaymentForm && (
                  <p className="text-gray-500">No payment methods saved.</p>
                )}
                {payments.map(pay => (
                  <div key={pay.id} className="border border-gray-200 rounded-xl p-5 flex justify-between items-center bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-gray-800 rounded-md flex items-center justify-center text-white font-bold text-xs">CARD</div>
                      <div>
                        <p className="font-bold text-gray-900">{pay.cardNumber}</p>
                        <p className="text-gray-500 text-sm">Expires {pay.expiry}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeletePayment(pay.id)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
              <div className="space-y-6 max-w-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Order Updates</h3>
                    <p className="text-sm text-gray-500">Get notified when your order ships.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notifications.orderUpdates} onChange={() => handleNotificationChange('orderUpdates')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Promotions & Sales</h3>
                    <p className="text-sm text-gray-500">Hear about discounts and new drops.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notifications.promotions} onChange={() => handleNotificationChange('promotions')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Newsletter</h3>
                    <p className="text-sm text-gray-500">Weekly fitness tips and guides.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notifications.newsletter} onChange={() => handleNotificationChange('newsletter')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h2>
              
              <div className="space-y-10 max-w-lg">
                
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                      <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                      <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                      <input type="email" disabled value={user?.email || ''} className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                    </div>
                    <button onClick={handleProfileSave} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <h3 className="text-lg font-bold text-red-600 mb-4 border-b border-red-100 pb-2">Danger Zone</h3>
                  <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                    <p className="text-sm text-red-600 mb-4 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
