import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Mail, Lock, User, ArrowRight, ShieldCheck, TrendingUp, Award, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate, location]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user profile exists, if not create it
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'user',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled. Please enable it in the Firebase Console.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d4af37]/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-card border border-border rounded-3xl p-10 shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold tracking-widest text-gold">ANTAM</span>
            <span className="text-xs font-sans tracking-tighter text-muted-foreground uppercase">Premium Gold</span>
          </div>
          <h1 className="text-3xl font-serif font-bold">
            Access Your Portfolio
          </h1>
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            Sign in with your Google account to manage your gold investments
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl mb-8 text-center font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-foreground text-background py-4 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50 group"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-background"></div>
            ) : (
              <>
                <Chrome size={20} />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-card px-4 text-muted-foreground">Secure Access</span>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            By continuing, you agree to our terms and conditions. Your data is protected by industry-standard encryption.
          </p>
        </div>

        <div className="mt-12 text-center space-y-6">
          <div className="flex items-center justify-center space-x-6 pt-6 border-t border-border">
            <div className="flex items-center space-x-2 text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
              <ShieldCheck size={12} className="text-gold" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2 text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
              <TrendingUp size={12} className="text-gold" />
              <span>Verified</span>
            </div>
            <div className="flex items-center space-x-2 text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
              <Award size={12} className="text-gold" />
              <span>Certified</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
