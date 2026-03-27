import { useEffect, useState, useMemo, FormEvent } from 'react';
import { collection, query, getDocs, orderBy, doc, updateDoc, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../App';
import { CheckCircle, Truck, Package, Search, ExternalLink, ShieldCheck, LayoutDashboard, ShoppingBag, Users, TrendingUp, Plus, Trash2, Edit3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

type Tab = 'dashboard' | 'orders' | 'products';

export default function Admin() {
  const { profile, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'paid' | 'shipped'>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    weight: 0,
    stock: 0,
    imageUrl: ''
  });

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Orders
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const ordersSnap = await getDocs(ordersQuery);
        const fetchedOrders = ordersSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Order[];
        setOrders(fetchedOrders);

        // Fetch Products
        const productsQuery = query(collection(db, 'products'), orderBy('name', 'asc'));
        const productsSnap = await getDocs(productsQuery);
        const fetchedProducts = productsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.totalAmount : acc, 0);
    const pendingPayments = orders.filter(o => o.status === 'pending').length;
    const activeShipments = orders.filter(o => o.status === 'paid').length;
    
    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingPayments,
      activeShipments
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayRevenue = orders
        .filter(o => o.createdAt.startsWith(date) && o.status !== 'cancelled')
        .reduce((acc, o) => acc + o.totalAmount, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue
      };
    });
  }, [orders]);

  const handleApprovePayment = async (orderId: string) => {
    const trackingNumber = 'PENDING-' + Math.random().toString(36).substring(7).toUpperCase();
    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'paid',
        trackingNumber,
        estimatedDelivery
      });
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'paid', trackingNumber, estimatedDelivery } as Order : o));
      alert('Payment approved successfully!');
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const handleShipOrder = async (orderId: string) => {
    const trackingNumber = 'ANTAM-' + Math.random().toString(36).substring(7).toUpperCase();
    const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'shipped',
        trackingNumber,
        estimatedDelivery
      });

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped', trackingNumber, estimatedDelivery } as Order : o));
      alert('Order marked as shipped!');
    } catch (error) {
      console.error('Error shipping order:', error);
    }
  };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productForm);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...productForm, id: editingProduct.id } as Product : p));
        alert('Product updated successfully!');
      } else {
        const docRef = await addDoc(collection(db, 'products'), productForm);
        setProducts(prev => [...prev, { ...productForm, id: docRef.id } as Product]);
        alert('Product added successfully!');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: 0, weight: 0, stock: 0, imageUrl: '' });
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders;
    return orders.filter(o => o.status === orderFilter);
  }, [orders, orderFilter]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-gold">
            <ShieldCheck size={24} />
            <span className="text-xs font-bold uppercase tracking-widest">Admin Control Panel</span>
          </div>
          <h1 className="text-4xl font-serif font-bold">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-2 bg-card p-1.5 rounded-2xl border border-border">
          {(['dashboard', 'orders', 'products'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${activeTab === tab ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'dashboard' && <LayoutDashboard size={14} />}
              {tab === 'orders' && <ShoppingBag size={14} />}
              {tab === 'products' && <Package size={14} />}
              <span>{tab}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-green-500' },
                { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
                { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: 'text-yellow-500' },
                { label: 'Active Shipments', value: stats.activeShipments, icon: Truck, color: 'text-gold' },
              ].map((stat, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4 hover:border-gold/30 transition-all">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif font-bold">Revenue Overview</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last 7 Days</span>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp ${v/1000000}M`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                        itemStyle={{ color: '#d4af37' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#d4af37" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border rounded-3xl p-8 space-y-8">
                <h3 className="text-xl font-serif font-bold">Recent Orders</h3>
                <div className="space-y-6">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between group cursor-pointer" onClick={() => { setActiveTab('orders'); setOrderFilter('all'); }}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-gold">
                          <Package size={18} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold">{order.invoiceNumber}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gold">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-gold transition-colors border-t border-border"
                  >
                    View All Orders
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold">Order Management</h2>
              <div className="flex items-center space-x-2 bg-card p-1 rounded-full border border-border">
                {(['all', 'pending', 'paid', 'shipped'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setOrderFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest transition-all ${orderFilter === f ? 'bg-gold text-black' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredOrders.map((order, index) => (
                <div key={order.id} className="bg-card border border-border rounded-2xl p-8 hover:border-gold/30 transition-all">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex items-start gap-6">
                      <div className="p-4 bg-background rounded-xl border border-border">
                        <Package size={32} className="text-gold" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <p className="text-lg font-bold">{order.invoiceNumber}</p>
                          <div className={`px-3 py-1 rounded-full border text-[8px] uppercase font-bold tracking-widest ${
                            order.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' :
                            order.status === 'paid' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                            order.status === 'shipped' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' :
                            'text-red-500 bg-red-500/10 border-red-500/20'
                          }`}>
                            {order.status}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ordered by <span className="text-foreground">{order.userEmail || order.userId}</span> on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-4 pt-2">
                          <p className="text-xl font-bold text-gold">{formatCurrency(order.totalAmount)}</p>
                          <span className="text-muted-foreground/30">|</span>
                          <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                      {order.paymentProofUrl && (
                        <a
                          href={order.paymentProofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-6 py-3 bg-background rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold/10 transition-all border border-border"
                        >
                          <ExternalLink size={16} />
                          <span>View Proof</span>
                        </a>
                      )}
                      
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleApprovePayment(order.id)}
                          className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
                        >
                          <CheckCircle size={16} />
                          <span>Approve Payment</span>
                        </button>
                      )}
                      
                      {order.status === 'paid' && (
                        <button
                          onClick={() => handleShipOrder(order.id)}
                          className="flex items-center space-x-2 px-8 py-3 bg-gold text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold-dark transition-all shadow-lg shadow-gold/20"
                        >
                          <Truck size={16} />
                          <span>Ship Order</span>
                        </button>
                      )}

                      <Link
                        to={`/invoice/${order.id}`}
                        className="p-3 bg-background rounded-xl hover:bg-muted transition-all border border-border"
                      >
                        <Search size={20} className="text-muted-foreground" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold">Product Inventory</h2>
              <button
                onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: 0, weight: 0, stock: 0, imageUrl: '' }); setIsProductModalOpen(true); }}
                className="bg-gold text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold-dark transition-all flex items-center space-x-2 shadow-lg shadow-gold/20"
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/30 transition-all group">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                      <button 
                        onClick={() => { setEditingProduct(product); setProductForm({ ...product }); setIsProductModalOpen(true); }}
                        className="p-3 bg-white text-black rounded-full hover:bg-gold transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-3 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-serif font-bold">{product.name}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{product.weight}g Certified</p>
                      </div>
                      <p className="font-bold text-gold">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                      </div>
                      <Link to={`/product/${product.id}`} className="text-[10px] font-bold uppercase tracking-widest text-gold hover:underline">View Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-card border border-border rounded-3xl p-8 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Name</label>
                  <input
                    required
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weight (Grams)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: parseFloat(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Base Price (IDR)</label>
                  <input
                    required
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock Quantity</label>
                  <input
                    required
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Image URL</label>
                  <input
                    required
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button
                    type="submit"
                    className="w-full bg-gold text-black py-4 rounded-xl font-bold hover:bg-gold-dark transition-all shadow-xl shadow-gold/20"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Clock = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
