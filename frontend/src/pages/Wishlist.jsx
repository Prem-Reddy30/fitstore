import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, wishlistCount } = useWishlist();

  if (wishlistCount === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart size={48} className="fill-red-400" />
        </div>
        <h1 className="text-4xl font-black text-gray-900">Your Wishlist is empty</h1>
        <p className="text-gray-500 text-lg">Save items you love by clicking the heart icon on any product.</p>
        <div className="pt-4">
          <Link to="/products" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-emerald-600 transition-colors shadow-lg">
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8 min-h-screen">
      <div className="flex justify-between items-end border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Heart className="fill-red-500 text-red-500" size={32} />
          My Wishlist
        </h1>
        <span className="text-gray-500 font-bold">{wishlistCount} {wishlistCount === 1 ? 'Item' : 'Items'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
