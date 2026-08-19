import { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { DollarSign, Users, ShoppingBag, TrendingUp, ArrowUpRight, ArrowDownRight, Download, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#6366f1', '#8b5cf6', '#06b6d4'];

const StatCard = ({ title, value, change, isPositive, icon: Icon, loading }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 text-gray-500 rounded-xl group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
        <Icon size={24} />
      </div>
      {change !== null && !loading && (
        <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {change}%
        </div>
      )}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-bold mb-1">{title}</p>
      {loading ? (
        <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-md mt-1"></div>
      ) : (
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
      )}
    </div>
  </div>
);

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('All Time');
  
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({ revenue: 0, orders: 0, users: 0, conversion: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // 1. Fetch Orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, users(name)')
          .order('created_at', { ascending: true });

        // 2. Fetch Users
        const { count: usersCount, error: usersError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch Order Items for categories
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('quantity, price, products(category)');

        if (ordersError) throw ordersError;
        if (itemsError) throw itemsError;

        // KPI Calculation
        const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total || 0), 0);
        const totalOrders = ordersData.length;
        const totalUsers = usersCount || 0;
        const conversionRate = totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : 0;

        setKpiData({
          revenue: totalRevenue,
          orders: totalOrders,
          users: totalUsers,
          conversion: conversionRate
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

        // Category Data
        const catSales = {};
        let totalCatValue = 0;
        itemsData.forEach(item => {
          const catName = item.products?.category || 'Uncategorized';
          const saleValue = (Number(item.price) || 0) * (Number(item.quantity) || 1);
          if (!catSales[catName]) {
            catSales[catName] = 0;
          }
          catSales[catName] += saleValue;
          totalCatValue += saleValue;
        });

        const pieData = Object.keys(catSales).map(key => ({
          name: key,
          value: catSales[key]
        }));
        setCategoryData(pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1 }]);

        // Recent Transactions
        const sortedDesc = [...ordersData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const recent = sortedDesc.slice(0, 5).map(order => ({
          id: order.id.split('-')[0].toUpperCase(),
          user: order.users?.name || 'Unknown User',
          date: new Date(order.created_at).toLocaleDateString(),
          amount: Number(order.total || 0),
          status: order.status || 'Unknown'
        }));
        setRecentTransactions(recent);

      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Analytics Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Track your store's performance and growth with live data.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex text-sm font-bold shadow-sm">
            {['All Time'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md transition-colors ${timeRange === range ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm text-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${kpiData.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} change={null} isPositive={true} icon={DollarSign} loading={loading} />
        <StatCard title="Total Orders" value={kpiData.orders.toLocaleString()} change={null} isPositive={true} icon={ShoppingBag} loading={loading} />
        <StatCard title="Total Users" value={kpiData.users.toLocaleString()} change={null} isPositive={true} icon={Users} loading={loading} />
        <StatCard title="Conversion Rate" value={`${kpiData.conversion}%`} change={null} isPositive={true} icon={TrendingUp} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Growth</h2>
              <p className="text-gray-500 text-sm">Monthly revenue over the selected period.</p>
            </div>
            <div className="text-gray-400 bg-gray-50 p-2 rounded-lg">
              <Calendar size={20} />
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-2xl backdrop-blur-sm">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sales by Category</h2>
            <p className="text-gray-500 text-sm mb-6">Distribution of revenue across categories.</p>
          </div>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend */}
          <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 max-h-32 overflow-y-auto no-scrollbar">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="flex-shrink-0 w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-gray-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No transactions found.</td>
                </tr>
              ) : (
                recentTransactions.map((trx, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{trx.id}</td>
                    <td className="px-6 py-4">{trx.user}</td>
                    <td className="px-6 py-4 text-gray-500">{trx.date}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{trx.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                        trx.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                        trx.status === 'processing' ? 'bg-amber-50 text-amber-600' :
                        trx.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
