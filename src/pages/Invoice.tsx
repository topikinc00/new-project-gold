import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';
import { formatCurrency } from '../lib/utils';
import { CheckCircle, Clock, Download, ExternalLink, ShieldCheck, CreditCard, ArrowLeft, Truck, PackageSearch, AlertCircle, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function Invoice() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [paymentMethod] = useState<'bank'>('bank');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder({ ...docSnap.data(), id: docSnap.id } as Order);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmPayment = async () => {
    if (!id || !selectedFile) {
      alert('Please select a payment proof image first.');
      return;
    }
    setUploading(true);
    try {
      // In a real app, we would upload to Firebase Storage
      // For this demo, we use the base64 preview as the URL
      const trackingInfo = {
        status: 'paid',
        paymentProofUrl: previewUrl,
        trackingNumber: 'ANTAM-' + Math.random().toString(36).substring(7).toUpperCase(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      };
      await updateDoc(doc(db, 'orders', id), trackingInfo);
      
      setOrder(prev => prev ? { ...prev, ...trackingInfo } as Order : null);
      alert('Payment proof uploaded successfully! Our team will verify it shortly.');
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to upload payment proof.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-serif font-bold">Invoice Not Found</h2>
        <Link to="/profile" className="text-gold hover:underline">Back to My Orders</Link>
      </div>
    );
  }

  const statusColors = {
    pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    paid: 'text-green-500 bg-green-500/10 border-green-500/20',
    shipped: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    cancelled: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  const steps = [
    { id: 'pending', label: 'Order Placed', icon: Clock },
    { id: 'paid', label: 'Payment Verified', icon: ShieldCheck },
    { id: 'shipped', label: 'In Transit', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);
  const activeStepIndex = order.status === 'cancelled' ? -1 : currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <Link to="/profile" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-gold mb-12 transition-colors">
        <ArrowLeft size={16} />
        <span>Back to Orders</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Progress Stepper */}
        <div className="px-10 py-12 border-b border-border bg-muted/20">
          <div className="relative flex justify-between items-center max-w-2xl mx-auto">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2" />
            <motion.div 
              className="absolute top-1/2 left-0 h-0.5 bg-gold -translate-y-1/2"
              initial={{ width: 0 }}
              animate={{ width: `${(activeStepIndex / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < activeStepIndex;
              const isActive = index === activeStepIndex;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center space-y-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isCompleted ? 'bg-gold border-gold text-black' :
                    isActive ? 'bg-background border-gold text-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' :
                    'bg-background border-border text-muted-foreground/30'
                  }`}>
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${
                    isActive ? 'text-gold' : isCompleted ? 'text-foreground' : 'text-muted-foreground/30'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Header */}
        <div className="p-10 border-b border-border flex flex-col md:row justify-between items-start gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-serif font-bold tracking-widest text-gold">ANTAM</span>
              <span className="text-xs font-sans tracking-tighter text-muted-foreground uppercase">Premium Gold</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Invoice Number</p>
              <p className="text-xl font-bold">{order.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-4">
            <div className={`px-4 py-2 rounded-full border text-[10px] uppercase font-bold tracking-widest ${statusColors[order.status]}`}>
              {order.status}
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Order Date</p>
              <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`px-10 py-4 border-b border-border flex items-center space-x-3 ${
          order.status === 'pending' ? 'bg-yellow-500/5 text-yellow-500' :
          order.status === 'paid' ? 'bg-green-500/5 text-green-500' :
          order.status === 'shipped' ? 'bg-blue-500/5 text-blue-500' :
          'bg-red-500/5 text-red-500'
        }`}>
          {order.status === 'pending' && <Clock size={18} />}
          {order.status === 'paid' && <CheckCircle size={18} />}
          {order.status === 'shipped' && <Truck size={18} />}
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">
            Status: {order.status === 'pending' ? 'Awaiting Payment Verification' : 
                     order.status === 'paid' ? 'Payment Confirmed & Verified' :
                     order.status === 'shipped' ? 'Order Shipped & In Transit' :
                     'Order Cancelled'}
          </span>
        </div>

        {/* Content */}
        <div className="p-10 space-y-12">
          {/* Payment Instructions for Pending */}
          {order.status === 'pending' && (
            <div className="bg-gold/5 border border-gold/20 rounded-2xl p-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-gold">
                    <Clock size={24} className="animate-pulse" />
                    <h3 className="text-xl font-serif font-bold">Awaiting Payment</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                    Please complete your payment using the bank transfer details below.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Bank Name</p>
                  <p className="text-lg font-bold">Bank Mandiri (Official)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Account Number</p>
                  <p className="text-lg font-bold text-gold">123-00-1234567-8</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Account Holder</p>
                  <p className="text-lg font-bold">PT ANTAM GOLD PREMIUM</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-bold text-gold">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-gold/10 space-y-4">
                <div className="flex items-center space-x-2">
                  <CreditCard size={16} className="text-gold" />
                  <p className="text-xs font-bold uppercase tracking-widest text-gold">Upload Proof of Payment</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-32 h-32 bg-background border-2 border-dashed border-gold/20 rounded-xl flex items-center justify-center group-hover:border-gold/60 transition-colors overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Download size={24} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold">{selectedFile ? selectedFile.name : 'No file selected'}</p>
                    <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG. Max size: 5MB.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paid Status Info */}
          {order.status === 'paid' && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-8 space-y-6">
              <div className="flex items-center space-x-3 text-green-500">
                <CheckCircle size={24} />
                <h3 className="text-xl font-serif font-bold">Payment Confirmed</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Thank you! Your payment has been successfully verified. Our logistics team is now carefully preparing your premium gold for secure shipment. You will receive a tracking number shortly.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Verification Status</p>
                  <div className="flex items-center space-x-2 text-green-500">
                    <ShieldCheck size={16} />
                    <p className="text-lg font-bold">Verified & Secure</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Estimated Shipment</p>
                  <p className="text-lg font-bold">Within 24-48 Hours</p>
                </div>
              </div>
            </div>
          )}

          {/* Shipped Status Info */}
          {order.status === 'shipped' && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-blue-500">
                  <Truck size={24} />
                  <h3 className="text-xl font-serif font-bold">Package Shipped</h3>
                </div>
                <a 
                  href={`https://www.google.com/search?q=tracking+${order.trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-blue-500 hover:underline"
                >
                  <span>Track Live</span>
                  <ExternalLink size={14} />
                </a>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Your premium gold is on its way. We use high-security logistics to ensure your package arrives safely at your destination.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Tracking Number</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-bold">{order.trackingNumber}</p>
                    <PackageSearch size={16} className="text-blue-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Estimated Delivery</p>
                  <p className="text-lg font-bold">
                    {order.estimatedDelivery 
                      ? new Date(order.estimatedDelivery).toLocaleDateString('id-ID', { dateStyle: 'long' })
                      : 'Calculating...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gold">Order Details</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-4 border-b border-gold/5">
                  <div className="space-y-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-bold text-gold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-end pt-6">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Total Amount Due</p>
                <p className="text-4xl font-bold text-gold">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <ShieldCheck size={14} className="text-gold" />
                <span>LBMA Certified Transaction</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pt-12 border-t border-gold/10">
            {order.status === 'pending' ? (
              <button
                onClick={handleConfirmPayment}
                disabled={uploading}
                className="w-full sm:w-auto bg-gold text-black px-12 py-5 rounded-full text-lg font-bold hover:bg-gold-dark transition-all flex items-center justify-center space-x-3 shadow-xl shadow-gold/20"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black"></div>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Upload Payment Receipt</span>
                  </>
                )}
              </button>
            ) : order.status === 'paid' ? (
              <div className="flex items-center space-x-3 text-green-500 font-bold bg-green-500/10 px-8 py-4 rounded-full border border-green-500/20">
                <CheckCircle size={24} />
                <span>Verification Complete</span>
              </div>
            ) : order.status === 'shipped' ? (
              <div className="flex items-center space-x-3 text-blue-500 font-bold bg-blue-500/10 px-8 py-4 rounded-full border border-blue-500/20">
                <Truck size={24} />
                <span>In Transit</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-red-500 font-bold bg-red-500/10 px-8 py-4 rounded-full border border-red-500/20">
                <AlertCircle size={24} />
                <span>Order Cancelled</span>
              </div>
            )}
            <button className="w-full sm:w-auto px-12 py-5 rounded-full text-lg font-bold border border-gold/40 hover:bg-gold/10 transition-all flex items-center justify-center space-x-3">
              <Download size={20} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
