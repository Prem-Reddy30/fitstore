import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Users, Package, Loader2 } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import StatCard from '../components/StatCard';
import { supabase } from '../../supabase/supabaseClient';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch Orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, users(name)')
          .order('created_at', { ascending: true });

        // Fetch Users count
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // Fetch Products count
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (ordersError) throw ordersError;

        // Calculate Stats
        const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const totalOrders = ordersData.length;
        
        setStats({
          revenue: totalRevenue,
          orders: totalOrders,
          customers: usersCount || 0,
          products: productsCount || 0
        });

        // Revenue Chart Data (Group by Month/Year)
        const monthlyRevenue = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        ordersData.forEach(order => {
          const date = new Date(order.created_at);
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          const key = `${month} ${year}`;
          
          if (!monthlyRevenue[key]) {
            monthlyRevenue[key] = { name: key, revenue: 0 };
          }
          monthlyRevenue[key].revenue += Number(order.total || 0);
        });
        
        const chartData = Object.values(monthlyRevenue).slice(-6); // Last 6 recorded months
        setRevenueData(chartData.length > 0 ? chartData : [{ name: 'No Data', revenue: 0 }]);

        // Recent Orders
        const sortedDesc = [...ordersData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const recent = sortedDesc.slice(0, 5).map(order => ({
          id: order.id.split('-')[0].toUpperCase(),
          user: order.users?.name || 'Unknown User',
          date: new Date(order.created_at).toLocaleDateString(),
          amount: Number(order.total || 0),
          status: order.status || 'Unknown'
        }));
        setRecentOrders(recent);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <button className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm text-sm">
          Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={<DollarSign size={24} />} 
          positive={true} 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders.toLocaleString()} 
          icon={<ShoppingCart size={24} />} 
          positive={true} 
        />
        <StatCard 
          title="Total Customers" 
          value={stats.customers.toLocaleString()} 
          icon={<Users size={24} />} 
          positive={true} 
        />
        <StatCard 
          title="Total Products" 
          value={stats.products.toLocaleString()} 
          icon={<Package size={24} />} 
          positive={true} 
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}
        
        {/* Chart Area */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sales Overview</h2>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueDb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueDb)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentOrders.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-6">
                <ShoppingCart size={48} className="mb-4 text-gray-300" />
                <p>No recent orders found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50/50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{order.user}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">₹{order.amount.toFixed(2)}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                        order.status === 'processing' ? 'bg-amber-50 text-amber-600' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
