import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Truck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-stone-800">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🍅</span>
              <span className="text-2xl font-black text-white tracking-tight">TOMAT</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-600/30 text-red-400 rounded-full border border-red-500/30">
                Fresh Produce
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Pakistan's first dedicated artisanal fresh tomato boutique. We deliver farm-to-table hydroponic Roma, Cherry, Beefsteak, and Heirloom varieties with guaranteed freshness.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-200 mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition">Fresh Storefront</Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-white transition">My Order History</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">Admin Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Value Badges */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-200 mb-3">Quality Promise</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Organic & Hydroponic</span>
              </li>
              <li className="flex items-center space-x-2">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>Next-Day Doorstep Delivery</span>
              </li>
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Low-Stock Inventory Control</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <p>© {new Date().getFullYear()} TOMAT App — Fresh Produce E-Commerce & Inventory Management.</p>
          <p className="flex items-center space-x-1">
            <span>Built with FastAPI, React, Tailwind CSS & MySQL</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
