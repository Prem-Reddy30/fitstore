import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/supabaseClient';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Heart, Star, Loader2, ArrowLeft, Send, Info } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Image Gallery State
  const [activeImage, setActiveImage] = useState('');

  // Review states
  const [reviews, setReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;
        setProduct(productData);
        setActiveImage(productData.image_url || productData.image);

        // 2. Fetch Reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*, users(name)')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (!reviewsError && reviewsData) {
          setReviews(reviewsData);
        }

        // 3. Verify Purchase and Delivery if logged in
        if (user) {
          const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('id, status, order_items(product_id)')
            .eq('user_id', user.uid);
            
          if (!orderError && orders) {
            const delivered = orders.some(order => 
              order.status === 'delivered' && order.order_items.some(item => item.product_id === id)
            );
            setHasPurchased(delivered);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id, user]);

  const handleAddToCart = () => {
    setAddingToCart(true);
    addToCart(product);
    setTimeout(() => {
      setAddingToCart(false);
      navigate('/cart');
    }, 500);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    if (!reviewForm.comment.trim()) {
      setReviewError("Please write a comment.");
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          product_id: product.id,
          user_id: user.uid,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        }])
        .select('*, users(name)')
        .single();
        
      if (error) throw error;
      
      setReviews([data, ...reviews]);
      setReviewForm({ rating: 5, comment: '' });
      setReviewSuccess(true);
      
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setReviewError("Failed to submit review: " + (err.message || err.details || "Unknown error"));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <h1 className="text-3xl font-black text-gray-900">Oops!</h1>
        <p className="text-gray-500">{error || "Product not found."}</p>
        <button onClick={() => navigate('/products')} className="text-primary font-bold hover:underline">
          Go back to products
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : product.rating;
    
  // Compile all images for the gallery
  const allImages = [product.image_url || product.image];
  
  if (product.image_gallery) {
    let parsedGallery = [];
    if (Array.isArray(product.image_gallery)) {
      parsedGallery = product.image_gallery;
    } else if (typeof product.image_gallery === 'string') {
      try {
        // Try parsing as JSON first
        parsedGallery = JSON.parse(product.image_gallery);
      } catch (e) {
        // Fallback to comma separated or postgres array format
        parsedGallery = product.image_gallery.replace(/^\{|\}$/g, '').split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      }
    }
    
    if (Array.isArray(parsedGallery)) {
      parsedGallery.forEach(img => {
        if (img && typeof img === 'string' && img.trim() !== '') {
          allImages.push(img.trim());
        }
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 font-bold transition-colors w-fit"
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* Left: Product Image Gallery */}
        <div className="space-y-4 sticky top-24 h-fit">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow h-[400px] md:h-[500px]">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
            />
          </div>
          
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 px-1 snap-x">
              {allImages.map((imgUrl, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`flex-shrink-0 w-20 h-20 bg-white rounded-xl border-2 p-2 snap-start transition-all ${activeImage === imgUrl ? 'border-primary shadow-md scale-105' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-primary uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <button 
                onClick={() => toggleWishlist(product)}
                className="p-3 bg-gray-50 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Heart size={24} className={isFavorited ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-green-600 text-white px-2 py-1 rounded font-bold text-sm">
                <span>{averageRating}</span>
                <Star size={14} className="fill-white ml-1" />
              </div>
              <a href="#reviews" className="text-gray-500 font-medium hover:text-primary transition-colors">
                {reviews.length} Ratings & Reviews
              </a>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-end gap-4 mb-2">
              <span className="text-5xl font-black text-gray-900">₹{product.price}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Inclusive of all taxes</p>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Product Description</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.description || "Premium quality product designed for maximum performance and durability. Built with high-grade materials to ensure long-lasting use."}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-8 grid grid-cols-2 gap-4">
            <button 
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="col-span-2 md:col-span-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black py-4 px-8 rounded-xl transition-all shadow-lg active:scale-95 flex justify-center items-center gap-2"
            >
              {addingToCart ? <Loader2 className="animate-spin" size={24} /> : <><ShoppingCart size={24} /> ADD TO CART</>}
            </button>
            <button 
              onClick={() => {
                addToCart(product);
                navigate('/checkout');
              }}
              className="col-span-2 md:col-span-1 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-8 rounded-xl transition-all shadow-lg active:scale-95 flex justify-center items-center"
            >
              BUY NOW
            </button>
          </div>
          
          {/* Ingredients / Specifications Table */}
          {(() => {
            let parsedIngredients = [];
            if (product.ingredients) {
              if (Array.isArray(product.ingredients)) {
                parsedIngredients = product.ingredients;
              } else if (typeof product.ingredients === 'string') {
                try {
                  parsedIngredients = JSON.parse(product.ingredients);
                } catch (e) {
                  console.error('Failed to parse ingredients', e);
                }
              }
            }
            
            if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) return null;
            
            return (
              <div className="mt-12 pt-8 border-t border-gray-200">
                 <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                   <Info size={24} className="text-primary" /> 
                   Specifications & Ingredients
                 </h3>
                 <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                   <table className="w-full text-left text-sm">
                     <tbody className="divide-y divide-gray-200">
                       {parsedIngredients.map((ing, idx) => (
                         <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                           <td className="py-3 px-6 font-bold text-gray-700 w-1/2 border-r border-gray-200">{ing.name}</td>
                           <td className="py-3 px-6 text-gray-600 w-1/2">{ing.amount}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>
            );
          })()}
          
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div id="reviews" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-4">Ratings & Reviews</h2>

        {/* Review Form (Only if purchased) */}
        {hasPurchased ? (
          <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rate this product</h3>
            {reviewSuccess && (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg font-bold mb-4">
                Thank you for your review!
              </div>
            )}
            {reviewError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg font-bold mb-4">
                {reviewError}
              </div>
            )}
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="p-1"
                  >
                    <Star 
                      size={32} 
                      className={star <= reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Write your review here..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                rows="3"
              />
              <button 
                type="submit"
                disabled={submittingReview}
                className="bg-primary hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {submittingReview ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Review</>}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-200 text-center">
            <p className="text-gray-600 font-bold">You must purchase and receive this product to leave a review.</p>
          </div>
        )}

        {/* Review List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                    <span>{review.rating}</span>
                    <Star size={10} className="fill-white ml-1" />
                  </div>
                  <span className="font-bold text-gray-900">{review.users?.name || 'Anonymous User'}</span>
                  <span className="text-sm text-gray-400 ml-auto">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-gray-400">
                  <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Certified Buyer
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductDetails;
