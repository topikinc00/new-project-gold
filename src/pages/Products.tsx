import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowRight, Plus, Minus, CreditCard } from 'lucide-react';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const MOCK_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Antam Gold Bar 0.5g', description: 'Pure 24K gold bar (99.99% purity) from Antam. Certified by LBMA.', price: 650000, weight: 0.5, stock: 100, imageUrl: 'https://picsum.photos/seed/gold05/400/400' },
  { name: 'Antam Gold Bar 1g', description: 'Pure 24K gold bar (99.99% purity) from Antam. Certified by LBMA.', price: 1200000, weight: 1, stock: 50, imageUrl: 'https://picsum.photos/seed/gold1/400/400' },
  { name: 'Antam Gold Bar 2g', description: 'Pure 24K gold bar (99.99% purity) from Antam. Certified by LBMA.', price: 2350000, weight: 2, stock: 30, imageUrl: 'https://picsum.photos/seed/gold2/400/400' },
  { name: 'Antam Gold Bar 5g', description: 'Pure 24K gold bar (99.99% purity) from Antam. Certified by LBMA.', price: 5800000, weight: 5, stock: 20, imageUrl: 'https://picsum.photos/seed/gold5/400/400' },
  { name: 'Antam Gold Bar 10g', description: 'Pure 24K gold bar (99.99% purity) from Antam. Certified by LBMA.', price: 11500000, weight: 10, stock: 15, imageUrl: 'https://picsum.photos/seed/gold10/400/400' },
  { name: 'Antam Gold Bar 25g', description: 'Pure 24K gold bar (99.99% purity) from Antam. Certified by LBMA.', price: 28500000, weight: 25, stock: 10, imageUrl: 'https://picsum.photos/seed/gold25/400/400' },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart, goldPrice } = useAuth();
  const navigate = useNavigate();

  const getQuantity = (id: string) => quantities[id] || 1;
  const updateQuantity = (id: string, q: number, stock: number) => {
    const newQ = Math.max(1, Math.min(stock, q));
    setQuantities(prev => ({ ...prev, [id]: newQ }));
  };

  // Calculate dynamic price based on live gold price
  const getDynamicPrice = (weight: number) => {
    // Add a small premium for smaller weights (minting/handling fees)
    const premium = weight < 1 ? 1.1 : weight < 5 ? 1.05 : 1.02;
    return Math.round(goldPrice * weight * premium);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), limit(20));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // Only attempt to seed if we have a user and they might be an admin
          // In a real app, this would be handled by a backend script or admin panel
          const fetchedProducts = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as Product[];
          
          if (fetchedProducts.length === 0) {
            // Try to seed, but catch permission errors
            try {
              const seededProducts: Product[] = [];
              for (const p of MOCK_PRODUCTS) {
                const docRef = await addDoc(collection(db, 'products'), p);
                seededProducts.push({ ...p, id: docRef.id });
              }
              setProducts(seededProducts);
            } catch (err) {
              console.warn('Seeding failed (likely due to permissions). Using mock data locally.');
              setProducts(MOCK_PRODUCTS.map((p, i) => ({ ...p, id: `mock-${i}` })) as Product[]);
            }
          }
        } else {
          const fetchedProducts = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as Product[];
          setProducts(fetchedProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback to mock data if fetch fails
        setProducts(MOCK_PRODUCTS.map((p, i) => ({ ...p, id: `mock-${i}` })) as Product[]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:row justify-between items-end mb-16 gap-8">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">Our Collection</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold">Premium Antam Gold</h1>
          <p className="text-muted-foreground max-w-xl">
            Browse our selection of certified Antam gold bars. Each piece is a symbol of purity and a gateway to secure investment.
          </p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span>Sort By:</span>
          <select className="bg-transparent border-b border-gold/20 focus:outline-none focus:border-gold text-foreground py-1">
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="weight">Weight</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/40 transition-all duration-500"
          >
            <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-gold/20">
                {product.weight}g
              </div>
            </Link>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Link to={`/product/${product.id}`} className="block text-xl font-serif font-bold hover:text-gold transition-colors">
                  {product.name}
                </Link>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gold">{formatCurrency(getDynamicPrice(product.weight))}</p>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">Live Price</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-background border border-border rounded-full p-1">
                    <button
                      onClick={() => updateQuantity(product.id, getQuantity(product.id) - 1, product.stock)}
                      className="p-1 hover:bg-muted rounded-full transition-colors text-gold"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={getQuantity(product.id)}
                      onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1, product.stock)}
                      className="w-8 bg-transparent text-center text-xs font-bold focus:outline-none"
                    />
                    <button
                      onClick={() => updateQuantity(product.id, getQuantity(product.id) + 1, product.stock)}
                      className="p-1 hover:bg-muted rounded-full transition-colors text-gold"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Stock: {product.stock}
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      const q = getQuantity(product.id);
                      addToCart({ ...product, price: getDynamicPrice(product.weight) }, q);
                      alert(`${q} ${product.name} added to cart!`);
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-card border border-gold text-gold rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold/10 transition-all"
                  >
                    <ShoppingCart size={14} />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => {
                      const q = getQuantity(product.id);
                      addToCart({ ...product, price: getDynamicPrice(product.weight) }, q);
                      navigate('/cart');
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-gold text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold-dark transition-all shadow-lg shadow-gold/10"
                  >
                    <CreditCard size={14} />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
