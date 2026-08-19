import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ code: '', discount_percentage: '', category_id: '', is_active: true });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: catData, error: catError } = await supabase.from('categories').select('*');
      if (catError) throw catError;
      setCategories(catData || []);

      const { data: coupData, error: coupError } = await supabase.from('coupons').select('*, categories(name)').order('created_at', { ascending: false });
      if (coupError) throw coupError;
      setCoupons(coupData || []);
    } catch (err) {
      console.error("Error fetching coupons data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({ code: '', discount_percentage: '', category_id: categories.length > 0 ? categories[0].id : '', is_active: true });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('coupons').insert([{ 
        code: formData.code.toUpperCase(), 
        discount_percentage: parseInt(formData.discount_percentage),
        category_id: formData.category_id,
        is_active: formData.is_active
      }]);
      if (error) throw error;
      
      setShowModal(false);
      fetchData(); // Refresh data
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-gray-900">Manage Coupons</h1>
        <button 
          onClick={handleOpenModal}
          className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm text-sm flex items-center gap-2"
        >
          <Plus size={18} /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No coupons found.</td>
                </tr>
              ) : (
                coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-black text-primary">{coupon.code}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{coupon.discount_percentage}% OFF</td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-bold">{coupon.categories?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleActive(coupon.id, coupon.is_active)} className="flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-full transition-colors hover:bg-gray-200">
                        {coupon.is_active ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-500" />}
                        <span className={coupon.is_active ? "text-emerald-700" : "text-red-700"}>{coupon.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Add New Coupon</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Coupon Code</label>
                <input 
                  type="text" 
                  required
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
                  placeholder="e.g. SUMMER20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Discount Percentage</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={e => setFormData({...formData, discount_percentage: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. 20"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Category</label>
                <select 
                  required
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Set as Active</label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 rounded-lg font-bold text-white bg-primary hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Coupons;
