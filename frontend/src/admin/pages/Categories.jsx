import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Layers, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('categories'); // 'categories' or 'subcategories'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('category'); // 'category' or 'subcategory'
  const [formData, setFormData] = useState({ name: '', image_url: '', category_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: cats, error: catError } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (catError) throw catError;
      setCategories(cats || []);

      const { data: subs, error: subError } = await supabase.from('subcategories').select('*, categories(name)').order('created_at', { ascending: false });
      if (subError) throw subError;
      setSubcategories(subs || []);
    } catch (err) {
      console.error("Error fetching category data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setFormData({ name: '', image_url: '', category_id: categories.length > 0 ? categories[0].id : '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'category') {
        const { error } = await supabase.from('categories').insert([{ 
          name: formData.name, 
          image_url: formData.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80' 
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subcategories').insert([{ 
          name: formData.name, 
          image_url: formData.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
          category_id: formData.category_id
        }]);
        if (error) throw error;
      }
      setShowModal(false);
      fetchData(); // Refresh data
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        const table = type === 'category' ? 'categories' : 'subcategories';
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        fetchData();
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-gray-900">Manage Categories</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenModal('category')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm text-sm flex items-center gap-2"
          >
            <Plus size={18} /> Main Category
          </button>
          <button 
            onClick={() => handleOpenModal('subcategory')}
            className="bg-primary hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm text-sm flex items-center gap-2"
          >
            <Plus size={18} /> Subcategory
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setView('categories')}
          className={`pb-3 px-1 font-bold text-sm border-b-2 transition-colors ${view === 'categories' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Main Categories
        </button>
        <button 
          onClick={() => setView('subcategories')}
          className={`pb-3 px-1 font-bold text-sm border-b-2 transition-colors ${view === 'subcategories' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Subcategories
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                {view === 'subcategories' && <th className="px-6 py-4">Parent Category</th>}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                  </td>
                </tr>
              ) : view === 'categories' ? (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete(cat.id, 'category')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                subcategories.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{sub.name}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-bold">{sub.categories?.name}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleDelete(sub.id, 'subcategory')} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">
                Add New {modalType === 'category' ? 'Category' : 'Subcategory'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder={`e.g. ${modalType === 'category' ? 'Nutrition' : 'Energy Bars'}`}
                />
              </div>

              {modalType === 'subcategory' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Parent Category</label>
                  <select 
                    required
                    value={formData.category_id}
                    onChange={e => setFormData({...formData, category_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                <input 
                  type="url" 
                  required
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="https://images.unsplash.com/..."
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><ImageIcon size={14}/> Must be a valid image URL</p>
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
                  Save {modalType === 'category' ? 'Category' : 'Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
