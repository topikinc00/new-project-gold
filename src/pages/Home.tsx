import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, TrendingUp, Award } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background z-10" />
          <img
            src="https://picsum.photos/seed/gold/1920/1080?blur=4"
            alt="Gold Background"
            className="w-full h-full object-cover scale-110 animate-pulse"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-gold">The Ultimate Safe Haven</span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold leading-tight tracking-tight">
              Invest in <br />
              <span className="text-gold italic">Pure Excellence</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
              Secure your future with authentic Antam gold bars. Certified, liquid, and timeless.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6"
          >
            <Link
              to="/products"
              className="group bg-gold text-black px-10 py-4 rounded-full text-lg font-bold hover:bg-gold-dark transition-all flex items-center space-x-3"
            >
              <span>Explore Collection</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-10 py-4 rounded-full text-lg font-bold border border-gold/40 hover:bg-gold/10 transition-all"
            >
              Start Investing
            </Link>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-12 text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={14} className="text-gold" />
            <span>Certified Authentic</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp size={14} className="text-gold" />
            <span>Market Linked Price</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award size={14} className="text-gold" />
            <span>Premium Quality</span>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="space-y-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gold">Why Antam Gold?</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              A Legacy of <br /> Trust and Value
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Antam gold bars are the benchmark for gold investment in Indonesia. Each bar comes with a LBMA-certified certificate, ensuring worldwide liquidity and authenticity.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-2">
                <h4 className="text-3xl font-serif text-gold">99.99%</h4>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Purity Level</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-serif text-gold">LBMA</h4>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Certified Quality</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gold/10 blur-3xl rounded-full" />
            <img
              src="https://picsum.photos/seed/goldbar/800/1000"
              alt="Antam Gold Bar"
              className="relative rounded-2xl shadow-2xl border border-gold/20"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-gold/5 border-y border-gold/10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-4xl md:text-6xl font-serif font-bold">Ready to build your <br /> <span className="text-gold italic">Golden Portfolio?</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of smart investors who trust Antam Gold Premium for their wealth preservation.
          </p>
          <Link
            to="/login"
            className="inline-block bg-gold text-black px-12 py-5 rounded-full text-xl font-bold hover:bg-gold-dark transition-all shadow-xl shadow-gold/20"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
