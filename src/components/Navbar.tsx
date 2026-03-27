import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, TrendingUp, TrendingDown, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../App';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { formatCurrency } from '../lib/utils';

export default function Navbar() {
  const { user, profile, cart, goldPrice, priceChange, theme, toggleTheme } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-gold/20">
      {/* Price Ticker */}
      <div className="bg-[#d4af37] text-black py-1 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block px-4">
          <div className="flex items-center space-x-8 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center space-x-2">
              <span>Live Gold Price:</span>
              <span className="font-serif">{formatCurrency(goldPrice)} / gram</span>
              {priceChange >= 0 ? (
                <TrendingUp size={12} className="text-green-800" />
              ) : (
                <TrendingDown size={12} className="text-red-800" />
              )}
            </div>
            <span className="opacity-30">|</span>
            <span>Certified Antam 24K</span>
            <span className="opacity-30">|</span>
            <span>LBMA Accredited</span>
            <span className="opacity-30">|</span>
            <span>Secure Delivery</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold tracking-widest text-[#d4af37]">ANTAM</span>
            <span className="text-xs font-sans tracking-tighter text-gray-400 uppercase">Premium Gold</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:text-gold transition-colors rounded-full hover:bg-gold/10"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link to="/products" className="text-sm font-medium hover:text-[#d4af37] transition-colors">Products</Link>
            {profile?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-bold text-[#d4af37] flex items-center space-x-1">
                <ShieldCheck size={16} />
                <span>Admin</span>
              </Link>
            )}
            <Link to="/cart" className="relative p-2 hover:text-[#d4af37] transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d4af37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="p-2 hover:text-[#d4af37] transition-colors">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="p-2 hover:text-red-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-[#d4af37] text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-[#b8962e] transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:text-gold transition-colors rounded-full hover:bg-gold/10"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link to="/cart" className="relative p-2">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d4af37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-gold/20 py-4 px-4 space-y-4">
          <Link to="/products" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Products</Link>
          {profile?.role === 'admin' && (
            <Link to="/admin" className="block text-lg font-bold text-[#d4af37]" onClick={() => setIsOpen(false)}>Admin Panel</Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="block text-lg font-medium" onClick={() => setIsOpen(false)}>Profile</Link>
              <button onClick={handleLogout} className="block text-lg font-medium text-red-500">Logout</button>
            </>
          ) : (
            <Link to="/login" className="block text-lg font-medium text-[#d4af37]" onClick={() => setIsOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
