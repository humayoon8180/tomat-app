import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, CheckCircle, ShieldCheck, Truck, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CartCheckout = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (cartItems.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        shipping_address: shippingAddress,
        contact_number: contactNumber,
        payment_method: paymentMethod
      };

      await api.post('/api/orders', orderPayload);
      clearCart();
      navigate('/my-orders', { state: { orderPlaced: true } });
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to place order. Please check stock levels and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-stone-50/60 px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Your Cart is Empty</h2>
          <p className="mt-2 text-sm text-stone-500 font-medium">
            Looks like you haven't added any fresh tomatoes to your cart yet.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 hover:shadow-lg transition"
          >
            <span>Explore Fresh Produce</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 mb-6">
          <Link to="/" className="text-xs font-bold text-stone-500 hover:text-stone-900 flex items-center transition">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-8">
          Shopping Cart & Checkout
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden p-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                <h2 className="text-base font-black text-stone-900">
                  Cart Items ({cartItems.length})
                </h2>
                <button
                  onClick={clearCart}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline font-bold cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex items-center space-x-4">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200'}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80';
                      }}
                      className="w-18 h-18 rounded-2xl object-cover bg-stone-100 flex-shrink-0 border border-stone-200/60"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-md">
                          {item.variety}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 mt-1 truncate">{item.title}</h3>
                      <p className="text-xs text-stone-500 font-medium">Rs. {item.price_per_unit} / kg</p>

                      <div className="mt-2 flex items-center space-x-3">
                        <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50/80 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs text-stone-700 hover:bg-white rounded-lg transition font-bold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-900">{item.quantity} kg</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs text-stone-700 hover:bg-white rounded-lg transition font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] text-stone-400">In stock: {item.stock_quantity} kg</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-stone-900">
                        Rs. {(item.price_per_unit * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-3 text-stone-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form & Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleCheckout} className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-5">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <h2 className="text-base font-black text-stone-900">
                  Delivery & Payment
                </h2>
                <div className="flex items-center text-[11px] text-stone-400 font-semibold">
                  <Lock className="w-3 h-3 mr-1 text-emerald-600" />
                  Secure Checkout
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="Apartment, Street address, Landmark, City..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-3 focus:ring-red-500/20 focus:border-red-500 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="e.g. +92 300 1234567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-3 focus:ring-red-500/20 focus:border-red-500 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center p-3 rounded-2xl cursor-pointer border transition ${
                    paymentMethod === 'Cash on Delivery' 
                      ? 'border-red-500 bg-red-50/40 text-red-950 font-bold' 
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-3 text-xs sm:text-sm">💵 Cash on Delivery (Pay at Doorstep)</span>
                  </label>

                  <label className={`flex items-center p-3 rounded-2xl cursor-pointer border transition ${
                    paymentMethod === 'Dummy Card Payment' 
                      ? 'border-red-500 bg-red-50/40 text-red-950 font-bold' 
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Dummy Card Payment"
                      checked={paymentMethod === 'Dummy Card Payment'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-3 text-xs sm:text-sm">💳 Card Payment (Demo Sandbox)</span>
                  </label>
                </div>
              </div>

              {/* Price Calculations */}
              <div className="border-t border-stone-100 pt-4 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold text-stone-800">Rs. {subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center">
                    <Truck className="w-3.5 h-3.5 mr-1 text-stone-400" />
                    Delivery Fee
                  </span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-black">FREE</span>
                    ) : (
                      <span className="font-bold text-stone-800">Rs. {deliveryFee.toFixed(2)}</span>
                    )}
                  </span>
                </div>

                {subtotal < 500 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 font-semibold flex items-center space-x-1.5">
                    <span>💡 Add <strong>Rs. {(500 - subtotal).toFixed(2)}</strong> more for FREE Delivery!</span>
                  </div>
                )}

                <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-black text-stone-900">
                  <span>Total Amount</span>
                  <span className="text-red-600 text-xl font-black">Rs. {total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 active:scale-98 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-red-600/20 hover:shadow-lg transition flex items-center justify-center space-x-2 disabled:bg-stone-300 cursor-pointer"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Confirm Order Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
