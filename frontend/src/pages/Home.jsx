import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import { ArrowRight, Zap, ShieldCheck, Trophy } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch featured products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .limit(4);
      
      if (products) {
        setFeaturedProducts(products);
      }

      // Fetch dynamic categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });
        
      if (cats) {
        setCategories(cats);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-24 pb-16">
      
      {/* Hero Section */}
      <HeroCarousel />

      {/* Features/Trust Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-gray-200">
        <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300">
          <div className="bg-emerald-100 p-4 rounded-full text-primary mb-2">
            <Zap size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Fast Performance</h3>
          <p className="text-gray-500">Gear engineered for maximum output.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300">
          <div className="bg-emerald-100 p-4 rounded-full text-primary mb-2">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Premium Quality</h3>
          <p className="text-gray-500">Built to last through the toughest workouts.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300">
          <div className="bg-emerald-100 p-4 rounded-full text-primary mb-2">
            <Trophy size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Pro Approved</h3>
          <p className="text-gray-500">Trusted by top athletes worldwide.</p>
        </div>
      </section>


      {/* Categories */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">Shop by Category</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              to={`/products?category=${category.name.toLowerCase()}`}
              key={category.id} 
              className="group relative h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <img 
                src={category.image_url} 
                alt={category.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:via-black/40 transition-colors"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-black text-white mb-2">{category.name}</h3>
                <div className="flex items-center text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Shop Now <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>



    </div>
  );
};

export default Home;
