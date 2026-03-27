import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Review } from '../types';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../App';
import { ShoppingCart, ShieldCheck, Award, TrendingUp, ArrowLeft, Star, MessageSquare, Plus, Minus, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart, user, profile, goldPrice } = useAuth();
  const navigate = useNavigate();

  // Calculate dynamic price based on live gold price
  const getDynamicPrice = (weight: number) => {
    // Add a small premium for smaller weights (minting/handling fees)
    const premium = weight < 1 ? 1.1 : weight < 5 ? 1.05 : 1.02;
    return Math.round(goldPrice * weight * premium);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      // Fetch Product
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ ...docSnap.data(), id: docSnap.id } as Product);
      }

      // Fetch Reviews
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', id),
        orderBy('createdAt', 'desc')
      );
      const reviewsSnap = await getDocs(reviewsQuery);
      setReviews(reviewsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Review)));

      // Check if user has purchased
      if (user) {
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          where('status', 'in', ['paid', 'shipped'])
        );
        const ordersSnap = await getDocs(ordersQuery);
        const purchased = ordersSnap.docs.some(doc => {
          const orderData = doc.data();
          return orderData.items.some((item: any) => item.productId === id);
        });
        setHasPurchased(purchased);
      }

      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !profile) return;
    setReviewLoading(true);

    try {
      const reviewData = {
        productId: id,
        userId: user.uid,
        userName: profile.displayName || 'Anonymous',
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      setReviews(prev => [{ ...reviewData, id: docRef.id }, ...prev]);
      setComment('');
      setRating(5);
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-serif font-bold">Product Not Found</h2>
        <Link to="/products" className="text-gold hover:underline">Back to Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <Link to="/products" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-gold mb-12 transition-colors">
        <ArrowLeft size={16} />
        <span>Back to Collection</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-3xl overflow-hidden border border-border shadow-2xl"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gold">Antam Gold Bar</span>
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{product.weight}g Certified</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <p className="text-3xl font-bold text-gold">{formatCurrency(getDynamicPrice(product.weight))}</p>
              <div className="flex items-center space-x-2 bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
                <span className="animate-pulse w-2 h-2 bg-gold rounded-full" />
                <span className="text-[10px] text-gold font-bold uppercase tracking-widest">Live Price</span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg max-w-xl">
              {product.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-y border-border">
            <div className="flex items-center space-x-3">
              <ShieldCheck size={20} className="text-gold" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">99.99% Pure</span>
            </div>
            <div className="flex items-center space-x-3">
              <Award size={20} className="text-gold" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">LBMA Certified</span>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp size={20} className="text-gold" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Market Linked</span>
            </div>
          </div>

          <div className="flex flex-col space-y-6 pt-8">
            <div className="flex items-center space-x-6">
              <div className="flex items-center bg-background border border-border rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-muted rounded-full transition-colors text-gold"
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  className="w-12 bg-transparent text-center font-bold focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 hover:bg-muted rounded-full transition-colors text-gold"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Stock Available: <span className="text-foreground">{product.stock} units</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => {
                  addToCart({ ...product, price: getDynamicPrice(product.weight) }, quantity);
                  alert(`${quantity} ${product.name} added to cart!`);
                }}
                className="w-full sm:flex-1 bg-card border border-gold text-gold px-8 py-5 rounded-full text-lg font-bold hover:bg-gold/10 transition-all flex items-center justify-center space-x-3"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() => {
                  addToCart({ ...product, price: getDynamicPrice(product.weight) }, quantity);
                  navigate('/cart');
                }}
                className="w-full sm:flex-1 bg-gold text-black px-8 py-5 rounded-full text-lg font-bold hover:bg-gold-dark transition-all flex items-center justify-center space-x-3 shadow-xl shadow-gold/20"
              >
                <CreditCard size={20} />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          <div className="pt-12 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gold">Investment Details</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex justify-between border-b border-border pb-2">
                <span>Weight</span>
                <span className="text-foreground font-bold">{product.weight} Gram</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span>Purity</span>
                <span className="text-foreground font-bold">99.99% (24K)</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span>Manufacturer</span>
                <span className="text-foreground font-bold">PT Antam Tbk</span>
              </li>
              <li className="flex justify-between border-b border-border pb-2">
                <span>Certification</span>
                <span className="text-foreground font-bold">LBMA Accredited</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div className="mt-32 space-y-16">
        <div className="flex flex-col md:row justify-between items-end gap-8 border-b border-border pb-8">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Customer Feedback</span>
            <h2 className="text-4xl font-serif font-bold">Reviews & Ratings</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex text-gold">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={20} fill={reviews.length > 0 && (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) >= s ? 'currentColor' : 'none'} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-bold">
              {reviews.length > 0 
                ? `${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5.0` 
                : 'No reviews yet'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          {/* Review Form */}
          <div className="lg:col-span-1 space-y-8">
            {user ? (
              hasPurchased ? (
                <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
                  <h3 className="text-xl font-serif font-bold">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rating</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star size={24} fill={rating >= s ? 'currentColor' : 'none'} className={rating >= s ? 'text-gold' : 'text-muted-foreground/30'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your Comment</label>
                      <textarea
                        required
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-background border border-border rounded-xl px-4 py-3 w-full focus:outline-none focus:border-gold transition-colors text-sm"
                        placeholder="Share your experience with this premium gold..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="w-full bg-gold text-black py-4 rounded-xl text-sm font-bold hover:bg-gold-dark transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {reviewLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                      ) : (
                        <>
                          <MessageSquare size={16} />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-gold/5 border border-gold/20 rounded-3xl p-8 text-center space-y-4">
                  <ShieldCheck size={32} className="mx-auto text-gold" />
                  <p className="text-sm text-muted-foreground font-medium">Only verified purchasers can leave a review for this product.</p>
                </div>
              )
            ) : (
              <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground font-medium">Please login to leave a review.</p>
                <Link to="/login" className="inline-block text-gold font-bold hover:underline">Login Now</Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-8">
            {reviews.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-20 text-center space-y-4">
                <MessageSquare size={48} className="mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">Be the first to review this product.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-3xl p-8 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-bold">{review.userName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                          {new Date(review.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                        </p>
                      </div>
                      <div className="flex text-gold">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={review.rating >= s ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm italic">
                      "{review.comment}"
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
