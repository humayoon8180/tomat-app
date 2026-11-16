import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, XCircle, AlertCircle, Calendar, CreditCard, MapPin, Phone } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders/my-orders');
      setOrders(response.data);
    } catch (err) {
      setError('Could not load order history.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel Order #TOMAT-${orderId}? The reserved tomato stock will be returned to inventory.`)) {
      return;
    }
    setCancellingId(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Truck className="w-3.5 h-3.5 mr-1" />
            Shipped / In Transit
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Cancelled
          </span>
        );
      default: // Pending
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Pending Processing
          </span>
        );
    }
  };

  const getProgressStep = (status) => {
    if (status === 'Cancelled') return -1;
    if (status === 'Delivered') return 3;
    if (status === 'Shipped') return 2;
    return 1; // Pending
  };

  return (
    <div className="min-h-screen bg-stone-50/60 pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-5 border-b border-stone-200 gap-4">
          <div>
            <h1 className="text-3xl font-black text-stone-900 tracking-tight">Order History</h1>
            <p className="mt-1 text-sm text-stone-500 font-medium">
              Track real-time status and delivery progress of your fresh produce orders.
            </p>
          </div>
          <Link
            to="/"
            className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-xl border border-stone-200/80 shadow-xs transition"
          >
            + Order More Fresh Produce
          </Link>
        </div>

        {/* Order placed success banner */}
        {location.state?.orderPlaced && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center space-x-3 text-sm font-medium shadow-sm animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>🎉 Thank you! Your order was successfully submitted and your produce has been reserved!</span>
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent"></div>
            <p className="text-xs font-semibold text-stone-500">Loading order deliveries...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 shadow-sm p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-stone-900">No orders placed yet</h3>
            <p className="text-sm text-stone-500 mt-1">Once you order fresh tomatoes, you can track their status here.</p>
            <Link
              to="/"
              className="mt-5 inline-block px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-sm transition"
            >
              Browse Fresh Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStep = getProgressStep(order.status);
              const isCancelled = order.status === 'Cancelled';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Order Card Header */}
                  <div className="bg-stone-50/80 px-6 py-4 border-b border-stone-200/60 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 text-xs">
                      <div>
                        <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">Order ID</span>
                        <span className="font-extrabold text-stone-900 text-sm">#TOMAT-{order.id}</span>
                      </div>
                      <div className="border-l border-stone-200 pl-4">
                        <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">Date Placed</span>
                        <span className="font-bold text-stone-700 text-xs">
                          {new Date(order.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="border-l border-stone-200 pl-4 hidden sm:block">
                        <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">Payment</span>
                        <span className="font-bold text-stone-700 text-xs">{order.payment_method}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {getStatusBadge(order.status)}

                      {/* Cancel Order Button (Available only if Pending) */}
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}

                      <div className="text-right pl-2 border-l border-stone-200">
                        <span className="text-stone-400 font-semibold block text-[10px] uppercase tracking-wider">Total</span>
                        <span className="text-base font-black text-stone-900">
                          Rs. {order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Status Stepper / Tracker */}
                  {!isCancelled ? (
                    <div className="px-6 py-5 border-b border-stone-100 bg-white">
                      <div className="flex items-center justify-between max-w-xl mx-auto relative">
                        {/* Progress line */}
                        <div className="absolute top-3.5 left-4 right-4 h-1 bg-stone-100 -z-0">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%'
                            }}
                          ></div>
                        </div>

                        {/* Step 1: Placed */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-sm">
                            ✓
                          </div>
                          <span className="text-[11px] font-bold text-stone-800 mt-1.5">Order Placed</span>
                        </div>

                        {/* Step 2: Processing */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                            currentStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
                          }`}>
                            {currentStep > 1 ? '✓' : '2'}
                          </div>
                          <span className="text-[11px] font-bold text-stone-800 mt-1.5">Processing</span>
                        </div>

                        {/* Step 3: Shipped */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                            currentStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
                          }`}>
                            {currentStep > 2 ? '✓' : '3'}
                          </div>
                          <span className="text-[11px] font-bold text-stone-800 mt-1.5">Out for Delivery</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="flex flex-col items-center relative z-10">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                            currentStep === 3 ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-500'
                          }`}>
                            {currentStep === 3 ? '✓' : '4'}
                          </div>
                          <span className="text-[11px] font-bold text-stone-800 mt-1.5">Delivered</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-3 bg-red-50/60 border-b border-red-100 text-xs font-bold text-red-700 flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>This order was cancelled. Reserved quantities have been returned to warehouse stock.</span>
                    </div>
                  )}

                  {/* Order Details & Items Breakdown */}
                  <div className="p-6">
                    <div className="mb-4 text-xs text-stone-500 bg-stone-50 p-3 rounded-2xl flex flex-wrap items-center gap-y-2 gap-x-6">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span><strong>Address:</strong> {order.shipping_address}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span><strong>Phone:</strong> {order.contact_number}</span>
                      </div>
                    </div>

                    <div className="divide-y divide-stone-100">
                      {order.items?.map((item) => (
                        <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">🍅</span>
                            <div>
                              <div className="font-bold text-stone-900">
                                {item.product?.title || `Tomato Variety #${item.product_id}`}
                              </div>
                              <div className="text-[11px] text-stone-500 mt-0.5">
                                {item.quantity} kg @ Rs. {item.unit_price}/kg
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-stone-800">
                            Rs. {(item.quantity * item.unit_price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
