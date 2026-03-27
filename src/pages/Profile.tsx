import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Order } from '../types';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';
import { User, Package, Settings, ChevronRight, MapPin, Phone, Mail, ShieldCheck, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { profile, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        address: profile.address || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Order[];
      setOrders(fetchedOrders);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      alert('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const statusColors = {
    pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    paid: 'text-green-500 bg-green-500/10 border-green-500/20',
    shipped: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-card border border-border rounded-3xl p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20">
                <User size={48} className="text-gold" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-bold">{profile?.displayName || 'Investor'}</h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{profile?.role} Account</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-gold text-black font-bold' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <div className="flex items-center space-x-3">
                  <Package size={18} />
                  <span className="text-sm">My Orders</span>
                </div>
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-gold text-black font-bold' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <div className="flex items-center space-x-3">
                  <Settings size={18} />
                  <span className="text-sm">Profile Settings</span>
                </div>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="bg-gold/5 border border-gold/10 rounded-3xl p-8 space-y-4">
            <div className="flex items-center space-x-3 text-gold">
              <ShieldCheck size={18} />
              <span className="text-[10px] uppercase font-bold tracking-widest">Verified Investor</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-widest">
              Your account is fully verified for premium gold transactions.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          {activeTab === 'orders' ? (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">Portfolio History</span>
                  <h1 className="text-4xl font-serif font-bold">My Orders</h1>
                </div>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card rounded-2xl" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-card border border-border rounded-3xl p-20 text-center space-y-6">
                  <Package size={48} className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                  <Link to="/products" className="inline-block text-gold font-bold hover:underline">Start Investing</Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-card border border-border rounded-2xl p-6 hover:border-gold/30 transition-all flex flex-col md:row justify-between items-center gap-6"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="p-4 bg-background rounded-xl border border-border">
                          <Package size={24} className="text-gold" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold">{order.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center md:items-end space-y-2">
                        <p className="text-lg font-bold text-gold">{formatCurrency(order.totalAmount)}</p>
                        <div className={`px-3 py-1 rounded-full border text-[8px] uppercase font-bold tracking-widest ${statusColors[order.status]}`}>
                          {order.status}
                        </div>
                      </div>

                      <Link
                        to={`/invoice/${order.id}`}
                        className="p-3 bg-muted rounded-full hover:bg-gold hover:text-black transition-all"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gold">Account Management</span>
                  <h1 className="text-4xl font-serif font-bold">Profile Settings</h1>
                </div>
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-xs font-bold uppercase tracking-widest text-gold hover:underline"
                >
                  {editing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="bg-card border border-border rounded-3xl p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                      <div className="flex items-center space-x-3 bg-background border border-border rounded-xl px-4 py-3">
                        <User size={16} className="text-gold" />
                        <input
                          type="text"
                          disabled={!editing}
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="bg-transparent w-full focus:outline-none disabled:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                      <div className="flex items-center space-x-3 bg-background border border-border rounded-xl px-4 py-3">
                        <Mail size={16} className="text-gold" />
                        <input
                          type="email"
                          disabled
                          value={profile?.email}
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
                          disabled={!editing}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="bg-transparent w-full focus:outline-none disabled:text-muted-foreground"
                          placeholder="+62 812..."
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Default Shipping Address</label>
                      <textarea
                        disabled={!editing}
                        rows={4}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="bg-background border border-border rounded-xl px-4 py-3 w-full focus:outline-none focus:border-gold transition-colors disabled:text-muted-foreground"
                        placeholder="Enter your complete delivery address..."
                      />
                    </div>
                  </div>

                  {editing && (
                    <button
                      type="submit"
                      className="bg-gold text-black px-12 py-4 rounded-full text-sm font-bold hover:bg-gold-dark transition-all shadow-xl shadow-gold/20"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
