import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { formatCurrency } from '../lib/utils';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { cart, removeFromCart, addToCart } = useAuth();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-8">
        <div className="inline-flex p-8 bg-gold/10 rounded-full text-gold mb-8 animate-bounce">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold">Your Cart is Empty</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          It looks like you haven't added any premium gold to your collection yet.
        </p>
        <Link
          to="/products"
          className="inline-block bg-gold text-black px-12 py-5 rounded-full text-xl font-bold hover:bg-gold-dark transition-all shadow-xl shadow-gold/20"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:row justify-between items-end mb-16 gap-8">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">Your Selection</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground max-w-xl">
            Review your premium gold selection before proceeding to secure checkout.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 items-start">
        <div className="lg:col-span-2 space-y-8">
          {cart.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-card border border-border rounded-3xl hover:border-gold/30 transition-all group"
            >
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-border">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-grow space-y-4 text-center sm:text-left">
                <div className="space-y-1">
                  <h3 className="text-xl font-serif font-bold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">{item.weight}g Certified</p>
                </div>
                <p className="text-xl font-bold text-gold">{formatCurrency(item.price)}</p>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center bg-background rounded-full border border-border p-1">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 hover:text-gold transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="p-2 hover:text-gold transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-border rounded-3xl p-10 space-y-8 sticky top-32">
            <h3 className="text-xl font-serif font-bold border-b border-border pb-6">Order Summary</h3>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-foreground font-bold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gold font-bold">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Insurance</span>
                <span className="text-gold font-bold">INCLUDED</span>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-gold">{formatCurrency(total)}</p>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-gold text-black text-center py-5 rounded-full text-lg font-bold hover:bg-gold-dark transition-all shadow-xl shadow-gold/20 flex items-center justify-center space-x-3 group"
            >
              <span>Secure Checkout</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="pt-4 text-[10px] text-center text-muted-foreground uppercase tracking-[0.2em] font-bold">
              Secure 256-bit SSL Encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
