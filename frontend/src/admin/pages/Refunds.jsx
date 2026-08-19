import { Search, Eye, Download, RefreshCcw, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';

const Refunds = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            users (
              name
            )
          `)
          .in('status', ['refund_requested', 'replacement_requested', 'refunded', 'replaced'])
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          setRequests(data);
        }
      } catch (err) {
        console.error("Error fetching support requests:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequests();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
        
      if (!error) {
        setRequests(requests.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        throw error;
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'refunded':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1 w-fit"><CheckCircle size={12} /> Refunded</span>;
      case 'replaced':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1 w-fit"><CheckCircle size={12} /> Replaced</span>;
      case 'refund_requested':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1 w-fit"><RefreshCcw size={12} /> Refund Requested</span>;
      case 'replacement_requested':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1 w-fit"><RefreshCcw size={12} /> Replacement Req.</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Refunds & Replacements</h1>
          <p className="text-gray-500 text-sm mt-1">Manage customer support requests</p>
        </div>
        <button className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm text-sm flex items-center gap-2">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Request ID or Customer..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 md:w-80"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
              <option>All Support Requests</option>
              <option>Refund Requested</option>
              <option>Replacement Requested</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date Requested</th>
                <th className="px-6 py-4">Order Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-3">
                        <CheckCircle size={32} className="text-gray-400" />
                      </div>
                      <p className="font-bold text-gray-700 text-base">You're all caught up!</p>
                      <p className="text-sm">No active refund or replacement requests.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono text-xs">{req.id.split('-')[0]}</td>
                    <td className="px-6 py-4 font-medium">{req.users?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{Number(req.total).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg focus:ring-primary focus:border-primary p-2 shadow-sm mr-2"
                      >
                        <option value="refund_requested">Refund Req.</option>
                        <option value="refunded">Mark Refunded</option>
                        <option value="replacement_requested">Replacement Req.</option>
                        <option value="replaced">Mark Replaced</option>
                      </select>
                      <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="View Details">
                        <Eye size={18} />
                      </button>
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

export default Refunds;
