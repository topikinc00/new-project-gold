import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold tracking-widest text-gold">ANTAM</span>
            <span className="text-xs font-sans tracking-tighter text-muted-foreground uppercase">Premium Gold</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            The most trusted platform for authentic Antam gold bars. We provide secure, certified, and premium gold investment solutions.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="p-2 bg-card rounded-full hover:bg-gold/20 transition-colors border border-border">
              <Instagram size={18} className="text-muted-foreground hover:text-gold" />
            </a>
            <a href="#" className="p-2 bg-card rounded-full hover:bg-gold/20 transition-colors border border-border">
              <Facebook size={18} className="text-muted-foreground hover:text-gold" />
            </a>
            <a href="#" className="p-2 bg-card rounded-full hover:bg-gold/20 transition-colors border border-border">
              <Twitter size={18} className="text-muted-foreground hover:text-gold" />
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gold">Quick Links</h3>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li><Link to="/products" className="hover:text-gold transition-colors">All Products</Link></li>
            <li><Link to="/cart" className="hover:text-gold transition-colors">Shopping Cart</Link></li>
            <li><Link to="/profile" className="hover:text-gold transition-colors">My Account</Link></li>
            <li><a href="#" className="hover:text-gold transition-colors">Investment Guide</a></li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gold">Contact Us</h3>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex items-center space-x-3">
              <Mail size={16} className="text-gold" />
              <span>support@antamgold.com</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={16} className="text-gold" />
              <span>+62 21 1234 5678</span>
            </li>
            <li className="flex items-center space-x-3">
              <MapPin size={16} className="text-gold" />
              <span>Jakarta, Indonesia</span>
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gold">Newsletter</h3>
          <p className="text-sm text-muted-foreground">Subscribe for the latest gold price updates and exclusive offers.</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="bg-card border border-border rounded-l-full px-4 py-2 text-sm focus:outline-none focus:border-gold w-full"
            />
            <button className="bg-gold text-black px-6 py-2 rounded-r-full text-sm font-bold hover:bg-gold-dark transition-colors">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border flex flex-col md:row justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest">
        <p>© 2026 Antam Gold Premium. All rights reserved.</p>
        <div className="flex space-x-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
