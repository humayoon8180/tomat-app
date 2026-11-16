import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, ShieldAlert, Package, Home, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount, total } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">🍅</span>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-2xl tracking-tight text-stone-900 group-hover:text-red-600 transition-colors">
                  TOMAT
                </span>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                  Farm Fresh
                </span>
              </div>
              <div className="text-[10px] text-stone-400 font-medium hidden sm:block">
                Hydroponic & Organic Produce
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-5">
            <Link
              to="/"
              className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                isActive('/') 
                  ? 'bg-red-50 text-red-700' 
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Home className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Storefront
            </Link>

            {user && (
              <Link
                to="/my-orders"
                className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                  isActive('/my-orders') 
                    ? 'bg-red-50 text-red-700' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Package className="w-4 h-4 mr-1.5 hidden sm:inline" />
                My Orders
              </Link>
            )}

            {/* Admin Dashboard Pill */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                  isActive('/admin')
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <ShieldAlert className="w-4 h-4 mr-1.5" />
                Admin Panel
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl border transition ${
                isActive('/cart')
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200/80'
              }`}
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-red-600 text-white font-black text-[10px] rounded-full h-4.5 w-4.5 flex items-center justify-center animate-pulse shadow-sm">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden md:inline">
                {itemCount > 0 ? `Rs. ${total.toFixed(0)}` : 'Cart'}
              </span>
            </Link>

            {/* User Profile / Auth Actions */}
            {user ? (
              <div className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-stone-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-white text-xs font-black flex items-center justify-center shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-stone-400 capitalize font-medium">{user.role}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-stone-200">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
