import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { formatCurrency, generateInvoiceNumber } from '../lib/utils';
import { CreditCard, MapPin, Phone, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Checkout() {
  const { cart, profile, clearCart } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank'>('bank');
  const [formData, setFormData] = useState({
    address: profile?.address || '',
    phone: profile?.phone || '',
    notes: '',
  });

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const orderData = {
        userId: profile.uid,
        userEmail: profile.email,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        status: 'pending',
        invoiceNumber: generateInvoiceNumber(),
        createdAt: new Date().toISOString(),
        shippingAddress: formData.address,
        phoneNumber: formData.phone,
        notes: formData.notes,
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      clearCart();
      navigate(`/invoice/${docRef.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex flex-col md:row justify-between items-end mb-16 gap-8">
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gold">Final Step</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold">Secure Checkout</h1>
          <p className="text-muted-foreground max-w-xl">
            Complete your order details to finalize your premium gold investment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-24 items-start">
        <div className="lg:col-span-2 space-y-12">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="bg-card border border-border rounded-3xl p-10 space-y-8">
              <h3 className="text-xl font-serif font-bold border-b border-border pb-6 flex items-center space-x-3">
                <MapPin size={20} className="text-gold" />
                <span>Shipping Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                  <div className="flex items-center space-x-3 bg-background border border-border rounded-xl px-4 py-3">
                    <User size={16} className="text-gold" />
                    <input
                      type="text"
                      value={profile?.displayName || ''}
                      disabled
                      className="bg-transparent w-full focus:outline-none text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                  <div className="flex items-center space-x-3 bg-background border border-border rounded-xl px-4 py-3">
                    <Phone size={16} className="text-gold" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-transparent w-full focus:outline-none"
                      placeholder="+62 812..."
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shipping Address</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-background border border-border rounded-xl px-4 py-3 w-full focus:outline-none focus:border-gold transition-colors"
                    placeholder="Enter your complete delivery address..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order Notes (Optional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-background border border-border rounded-xl px-4 py-3 w-full focus:outline-none focus:border-gold transition-colors"
                    placeholder="Special instructions for delivery..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-10 space-y-8">
              <h3 className="text-xl font-serif font-bold border-b border-border pb-6 flex items-center space-x-3">
                <CreditCard size={20} className="text-gold" />
                <span>Payment Method</span>
              </h3>
              
              <div className="space-y-6">
                <div 
                  className="p-6 rounded-2xl flex items-center justify-between bg-gold/10 border border-gold"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-muted rounded-full">
                      <ShieldCheck size={24} className="text-gold" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold">Bank Transfer (Manual Verification)</p>
                      <p className="text-xs text-muted-foreground">Transfer to our official corporate account</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-4 border-gold bg-background" />
                </div>

                <p className="text-xs text-muted-foreground italic text-center">
                  * You will receive bank account details on the next page after confirming your order.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-black py-6 rounded-full text-xl font-bold hover:bg-gold-dark transition-all shadow-xl shadow-gold/20 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black"></div>
              ) : (
                <>
                  <span>Place Order & Generate Invoice</span>
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-card border border-border rounded-3xl p-10 space-y-8 sticky top-32">
            <h3 className="text-xl font-serif font-bold border-b border-border pb-6">Order Summary</h3>
            
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <p className="text-sm font-bold text-gold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-gold">{formatCurrency(total)}</p>
              </div>
            </div>

            <div className="bg-gold/5 p-6 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3 text-gold">
                <ShieldCheck size={18} />
                <span className="text-[10px] uppercase font-bold tracking-widest">Secure Transaction</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest">
                Your investment is protected by our premium insurance and secure delivery system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
