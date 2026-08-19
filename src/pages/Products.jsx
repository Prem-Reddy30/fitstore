import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import ProductCard from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  
  // New Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [showFilters, setShowFilters] = useState(false);
  
  // Watch for URL search parameter changes
  useEffect(() => {
    const s = searchParams.get('search');
    if (s) {
      setSearchQuery(s);
      setActiveCategory('All');
      setActiveSubcategory('All');
      
      // Clean up the URL quietly so it doesn't get stuck
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('search');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [categories, setCategories] = useState({ "All": [] });
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDynamicData();
  }, []);

  const fetchDynamicData = async () => {
    try {
      setLoading(true);
      const { data: cats } = await supabase.from('categories').select('*');
      const { data: subs } = await supabase.from('subcategories').select('*, categories(name)');

      if (cats && subs) {
        const newCats = { "All": [] };
        const newSubsMap = {};

        cats.forEach(c => {
          newCats[c.name] = ["All"];
        });

        subs.forEach(s => {
          const catName = s.categories?.name;
          if (catName) {
            newCats[catName].push(s.name);
            newSubsMap[s.name] = s.image_url;
          }
        });

        setCategories(newCats);
        setSubcategoriesMap(newSubsMap);

        const catKeys = Object.keys(newCats).map(k => k.toLowerCase());
        if (activeCategory.toLowerCase() !== 'all' && !catKeys.includes(activeCategory.toLowerCase())) {
          setActiveCategory('All');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [errorMsg, setErrorMsg] = useState('');

  const fetchProducts = async (casedCategory) => {
    try {
      setLoading(true);
      setErrorMsg('');
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      
      if (casedCategory !== 'All') {
        query = query.ilike('category', casedCategory);
      }
      
      if (activeSubcategory !== 'All') {
        query = query.eq('subcategory', activeSubcategory);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Supabase Error:", error);
        setErrorMsg(error.message);
        setProducts([]);
        return;
      }
      
      if (data) {
        let finalData = data;
        
        // 1. Search Query Filter
        if (searchQuery.trim()) {
          let q = searchQuery.trim().toLowerCase();
          
          finalData = finalData.filter(p => {
            const matchName = p.name?.toLowerCase().includes(q);
            const matchCat = p.category?.toLowerCase().includes(q);
            const matchSub = p.subcategory?.toLowerCase().includes(q);
            
            // Allow "protien" to match "protein" and vice versa
            let matchTypo = false;
            if (q.includes('protien') || q.includes('protein')) {
              const altQ = q.includes('protien') ? q.replace(/protien/g, 'protein') : q.replace(/protein/g, 'protien');
              matchTypo = p.name?.toLowerCase().includes(altQ) || 
                          p.category?.toLowerCase().includes(altQ) || 
                          p.subcategory?.toLowerCase().includes(altQ);
            }
            
            return matchName || matchCat || matchSub || matchTypo;
          });
        }
        
        console.log("Filtered Products:", finalData);
        
        // 2. Min Price Filter
        if (minPrice) {
          const limit = parseFloat(minPrice);
          finalData = finalData.filter(p => parseFloat(p.price) >= limit);
        }
        
        // 3. Max Price Filter
        if (maxPrice) {
          const limit = parseFloat(maxPrice);
          finalData = finalData.filter(p => parseFloat(p.price) <= limit);
        }
        
        // 4. Rating Filter
        if (minRating !== '0') {
          const limit = parseFloat(minRating);
          finalData = finalData.filter(p => {
            const pRating = p.rating ? parseFloat(p.rating) : 0;
            return pRating >= limit;
          });
        }
        
        setProducts(finalData);
      }
    } catch (err) {
      console.error("Error fetching products", err);
      setErrorMsg("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const matchedCategory = Object.keys(categories).find(c => c.toLowerCase() === activeCategory.toLowerCase());
    if (matchedCategory || activeCategory === 'All') {
      const timeoutId = setTimeout(() => {
        fetchProducts(matchedCategory || 'All');
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [activeCategory, activeSubcategory, categories, searchQuery, minPrice, maxPrice, minRating]);

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4">
      <div className="flex flex-col gap-8">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {Object.keys(categories).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat.toLowerCase());
                setActiveSubcategory('All');
                setSearchParams({ category: cat.toLowerCase() });
              }}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-gray-900">
                {activeSubcategory !== 'All' ? activeSubcategory : activeCategory === 'All' ? 'All Products' : activeCategory}
              </h1>
            </div>
            
            <div className="flex gap-3 mt-4 md:mt-0">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim() !== '') {
                      setActiveCategory('All');
                      setActiveSubcategory('All');
                      setSearchParams({});
                    }
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm font-medium w-full md:w-64"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${showFilters ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <SlidersHorizontal size={16} /> <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Min Price (₹)</label>
                <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Max Price (₹)</label>
                <input type="number" placeholder="5000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Minimum Rating</label>
                <select value={minRating} onChange={e => setMinRating(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-gray-50 font-bold text-gray-700">
                  <option value="0">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>
          )}

          {activeCategory.toLowerCase() !== 'all' && activeSubcategory === 'All' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Object.keys(categories).find(c => c.toLowerCase() === activeCategory.toLowerCase()) && 
               categories[Object.keys(categories).find(c => c.toLowerCase() === activeCategory.toLowerCase())]
               .filter(s => s !== 'All')
               .map(sub => (
                <div 
                  key={sub}
                  onClick={() => {
                    setActiveSubcategory(sub);
                  }}
                  className="group cursor-pointer bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                    <img 
                      src={subcategoriesMap[sub] || "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80"}
                      alt={sub}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-black text-xl text-gray-900 group-hover:text-primary transition-colors">{sub}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium mb-8">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500 font-bold text-lg">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
