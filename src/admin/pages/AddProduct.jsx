import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UploadCloud, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    price: '',
    stock: '',
    description: '',
    image: '',
    status: 'ACTIVE'
  });

  const [ingredients, setIngredients] = useState([]);
  const [imageGallery, setImageGallery] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (selectNewCatId = null, selectNewSubId = null) => {
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    const { data: subs } = await supabase.from('subcategories').select('*').order('name');
    
    if (cats && subs) {
      setCategories(cats);
      setSubcategories(subs);
      
      // Set defaults if no specific selection requested
      if (!selectNewCatId && !selectNewSubId && cats.length > 0) {
        const defaultCat = cats[0].name;
        const catSubs = subs.filter(s => s.category_id === cats[0].id);
        const defaultSub = catSubs.length > 0 ? catSubs[0].name : '';
        
        setFormData(prev => {
          if (!prev.category) {
            return { ...prev, category: defaultCat, subcategory: defaultSub };
          }
          return prev;
        });
      }
      
      if (selectNewCatId) {
        const newCat = cats.find(c => c.id === selectNewCatId);
        if (newCat) setFormData(prev => ({ ...prev, category: newCat.name, subcategory: '' }));
      }
      
      if (selectNewSubId) {
        const newSub = subs.find(s => s.id === selectNewSubId);
        if (newSub) setFormData(prev => ({ ...prev, subcategory: newSub.name }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // If main category changes, reset the subcategory to the first item of the new category
      if (name === 'category') {
        const selectedCat = categories.find(c => c.name === value);
        const catSubs = subcategories.filter(s => s.category_id === selectedCat?.id);
        const defaultSub = catSubs.length > 0 ? catSubs[0].name : '';
        return { ...prev, [name]: value, subcategory: defaultSub };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Gallery Handlers
  const handleAddGalleryImage = () => {
    setImageGallery([...imageGallery, '']);
  };
  const handleUpdateGalleryImage = (index, value) => {
    const newGallery = [...imageGallery];
    newGallery[index] = value;
    setImageGallery(newGallery);
  };
  const handleRemoveGalleryImage = (index) => {
    setImageGallery(imageGallery.filter((_, i) => i !== index));
  };

  // Ingredients Handlers
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '' }]);
  };
  const handleUpdateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };
  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleCreateCategory = async () => {
    const name = window.prompt("Enter new Main Category name:");
    if (!name) return;
    const image_url = window.prompt("Enter image URL for this category:");
    if (!image_url) return;

    try {
      const { data, error } = await supabase.from('categories').insert([{ name, image_url }]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        await fetchCategories(data[0].id, null);
      }
    } catch (err) {
      alert("Error creating category: " + err.message);
    }
  };

  const handleCreateSubcategory = async () => {
    const selectedCat = categories.find(c => c.name === formData.category);
    if (!selectedCat) {
      alert("Please select a Main Category first.");
      return;
    }
    
    const name = window.prompt(`Enter new Subcategory name for ${selectedCat.name}:`);
    if (!name) return;
    const image_url = window.prompt("Enter image URL for this subcategory:");
    if (!image_url) return;

    try {
      const { data, error } = await supabase.from('subcategories').insert([{ 
        name, 
        image_url, 
        category_id: selectedCat.id 
      }]).select();
      if (error) throw error;
      if (data && data.length > 0) {
        await fetchCategories(null, data[0].id);
      }
    } catch (err) {
      alert("Error creating subcategory: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty gallery images and ingredients
    const cleanGallery = imageGallery.filter(url => url.trim() !== '');
    const cleanIngredients = ingredients.filter(ing => ing.name.trim() !== '' && ing.amount.trim() !== '');

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          price: parseFloat(formData.price),
          category: formData.category,
          subcategory: formData.subcategory,
          description: formData.description,
          stock: parseInt(formData.stock) || 0,
          image_url: formData.image || "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80",
          image_gallery: cleanGallery,
          ingredients: cleanIngredients
        }]);

      if (error) throw error;
      
      alert('Product created successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("Failed to add product: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/products" className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Add New Product</h1>
          <p className="text-gray-500 text-sm">Create a new product for your store</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Main Details Card */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. 100% Whey Protein Isolate"
                required 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Category</label>
                <button type="button" onClick={handleCreateCategory} className="text-xs text-primary font-bold hover:underline">+ New Category</button>
              </div>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                {categories.length === 0 && <option value="">No categories exist</option>}
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Subcategory</label>
                <button type="button" onClick={handleCreateSubcategory} className="text-xs text-primary font-bold hover:underline">+ New Subcategory</button>
              </div>
              <select 
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                {subcategories.filter(sub => {
                    const selectedCat = categories.find(c => c.name === formData.category);
                    return sub.category_id === selectedCat?.id;
                  }).length === 0 && <option value="">No subcategories exist for this category</option>}
                
                {subcategories
                  .filter(sub => {
                    const selectedCat = categories.find(c => c.name === formData.category);
                    return sub.category_id === selectedCat?.id;
                  })
                  .map(sub => (
                    <option key={sub.id} value={sub.name}>{sub.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01" 
                placeholder="0.00"
                required 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4" 
                placeholder="Product description..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Ingredients & Features Card */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
             <h2 className="text-lg font-bold text-gray-900">Ingredients & Specifications</h2>
             <button type="button" onClick={handleAddIngredient} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
               <Plus size={14} /> Add Row
             </button>
          </div>
          
          {ingredients.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-xl">
              No ingredients or specs added.
            </div>
          ) : (
            <div className="space-y-3">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="e.g. Protein" 
                    value={ing.name}
                    onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="e.g. 24g" 
                    value={ing.amount}
                    onChange={(e) => handleUpdateIngredient(idx, 'amount', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                  />
                  <button type="button" onClick={() => handleRemoveIngredient(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media & Inventory Card */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Media & Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-6">
               
               {/* Main Image */}
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Main Product Image URL</label>
                 <input 
                  type="url" 
                  name="image"
                  value={formData.image.startsWith('data:') ? '' : formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/... (Primary Image)" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                 />
                 {formData.image && (
                   <div className="mt-4">
                     <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Main Preview</p>
                     <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                       <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                     </div>
                   </div>
                 )}
               </div>

               {/* Gallery Images */}
               <div className="pt-4 border-t border-gray-100">
                 <div className="flex justify-between items-center mb-4">
                   <label className="block text-sm font-bold text-gray-700">Additional Gallery Images</label>
                   <button type="button" onClick={handleAddGalleryImage} className="text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                     <Plus size={14} /> Add Image URL
                   </button>
                 </div>
                 
                 {imageGallery.length === 0 ? (
                   <p className="text-sm text-gray-400">No additional gallery images added.</p>
                 ) : (
                   <div className="space-y-3">
                     {imageGallery.map((url, idx) => (
                       <div key={idx} className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                           {url ? <img src={url} className="w-full h-full object-cover" alt="" /> : <UploadCloud size={16} className="text-gray-400" />}
                         </div>
                         <input 
                           type="url" 
                           placeholder="Gallery Image URL" 
                           value={url}
                           onChange={(e) => handleUpdateGalleryImage(idx, e.target.value)}
                           className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
                         />
                         <button type="button" onClick={() => handleRemoveGalleryImage(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                           <Trash2 size={18} />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
            
            <div className="md:col-span-2 border-t border-gray-100 pt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
              <input 
                type="number" 
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 pb-12">
          <Link to="/admin/products" className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors bg-white border border-gray-200 shadow-sm">
            Cancel
          </Link>
          <button type="submit" className="px-8 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-sm">
            <Save size={18} /> Save Product
          </button>
        </div>

      </form>
    </div>
  );
};
export default AddProduct;
