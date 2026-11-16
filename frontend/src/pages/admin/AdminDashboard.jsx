import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Plus, Edit, Trash2, Package, ShoppingCart, 
  DollarSign, RefreshCw, CheckCircle, XCircle, Search, Eye
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});
  const [productForm, setProductForm] = useState({
    title: '',
    variety: 'Roma',
    description: '',
    price_per_unit: '',
    stock_quantity: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [productsRes, lowStockRes, ordersRes] = await Promise.all([
        api.get('/api/products/admin/all'),
        api.get('/api/products/admin/low-stock'),
        api.get('/api/orders')
      ]);
      setProducts(productsRes.data);
      setLowStockProducts(lowStockRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open modal for Add or Edit
  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        title: prod.title,
        variety: prod.variety,
        description: prod.description || '',
        price_per_unit: prod.price_per_unit,
        stock_quantity: prod.stock_quantity,
        image_url: prod.image_url || '',
        is_active: prod.is_active
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        title: '',
        variety: 'Roma',
        description: '',
        price_per_unit: '',
        stock_quantity: '',
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price_per_unit: parseFloat(productForm.price_per_unit),
        stock_quantity: parseFloat(productForm.stock_quantity)
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, payload);
        showNotification(`Product '${payload.title}' updated successfully.`);
      } else {
        await api.post('/api/products', payload);
        showNotification(`New product '${payload.title}' created successfully.`);
      }
      setIsModalOpen(false);
      loadAllData();
    } catch (err) {
      showNotification(err.response?.data?.detail || 'Failed to save product.', true);
    }
  };

  const handleDeleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to deactivate '${title}'?`)) return;
    try {
      await api.delete(`/api/products/${id}`);
      showNotification(`Product '${title}' deactivated.`);
      loadAllData();
    } catch (err) {
      showNotification('Failed to deactivate product.', true);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      showNotification(`Order #${orderId} status updated to ${newStatus}.`);
      loadAllData();
    } catch (err) {
      showNotification('Failed to update order status.', true);
    }
  };

  // Quick Restock shortcut
  const handleQuickRestock = async (product) => {
    const additionalStock = prompt(`Enter kg to add to ${product.title} (Current: ${product.stock_quantity} kg):`, '20');
    if (!additionalStock || isNaN(additionalStock)) return;
    try {
      const newStock = product.stock_quantity + parseFloat(additionalStock);
      await api.put(`/api/products/${product.id}`, { stock_quantity: newStock });
      showNotification(`Restocked ${product.title} to ${newStock} kg!`);
      loadAllData();
    } catch (err) {
      showNotification('Failed to restock.', true);
    }
  };

  // KPI Calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center space-x-2 animate-fade-in ${
          notification.isError ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
        }`}>
          {notification.isError ? <XCircle className="w-5 h-5 text-red-200" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Inventory & Orders Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Manage farm produce varieties, real-time stock levels, and customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadAllData}
            className="p-2.5 bg-white border border-gray-300 rounded-xl text-gray-600 hover:text-gray-900 shadow-sm transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tomato Variety</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Total Revenue</span>
            <div className="text-xl font-extrabold text-gray-900">Rs. {totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Total Orders</span>
            <div className="text-xl font-extrabold text-gray-900">{orders.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase">Varieties in Catalog</span>
            <div className="text-xl font-extrabold text-gray-900">{products.length}</div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm flex items-center space-x-4 ${
          lowStockProducts.length > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'
        }`}>
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Low Stock (&lt; 10 kg)</span>
            <div className="text-xl font-extrabold text-amber-700">{lowStockProducts.length} Alert(s)</div>
          </div>
        </div>
      </div>

      {/* CRITICAL FEATURE (Module C): Visual Low-Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="mb-8 p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl shadow-md">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce text-yellow-200" />
            <div className="flex-1">
              <h3 className="font-extrabold text-base">⚠️ Low-Stock Alert Notification</h3>
              <p className="text-sm text-amber-100 mt-0.5">
                The following tomato varieties have dropped below the required 10 kg threshold:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lowStockProducts.map(p => (
                  <div
                    key={p.id}
                    className="bg-black/20 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-2"
                  >
                    <span>{p.title}: <span className="text-yellow-300 font-extrabold">{p.stock_quantity} kg</span> left</span>
                    <button
                      onClick={() => handleQuickRestock(p)}
                      className="bg-white text-gray-900 px-2 py-0.5 rounded text-[11px] hover:bg-yellow-200 transition font-bold"
                    >
                      Restock +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === 'inventory'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          🍅 Inventory Management ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          📦 Customer Orders ({orders.length})
        </button>
      </div>

      {/* TAB 1: Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Variety</th>
                  <th className="py-3.5 px-4">Price / kg</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((prod) => {
                  const isLow = prod.stock_quantity < 10.0;
                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4 flex items-center space-x-3">
                        <img
                          src={prod.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100'}
                          alt={prod.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&auto=format&fit=crop&q=80';
                          }}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{prod.title}</div>
                          <div className="text-xs text-gray-400">{prod.variety}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        Rs. {prod.price_per_unit.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {prod.stock_quantity} kg
                          {isLow && ' (Low)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          prod.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {prod.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(prod)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.title)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Deactivate Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Order Management */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Breakdown</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      #TOMAT-{order.id}
                      <div className="text-[11px] text-gray-400 font-normal">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{order.user?.name || `User #${order.user_id}`}</div>
                      <div className="text-xs text-gray-500">{order.contact_number}</div>
                      <div className="text-xs text-gray-400 truncate max-w-xs">{order.shipping_address}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-600">
                      {order.items?.map(i => (
                        <div key={i.id} className="leading-tight mb-1">
                          • {i.product?.title || `Item #${i.product_id}`} × <strong>{i.quantity} kg</strong>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-red-600">
                      Rs. {order.total_amount.toFixed(2)}
                      <div className="text-[11px] text-gray-400 font-normal">{order.payment_method}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {(() => {
                        const currentVal = statusDrafts[order.id] !== undefined ? statusDrafts[order.id] : order.status;
                        const hasChanged = currentVal !== order.status;
                        return (
                          <div className="flex items-center space-x-2">
                            <select
                              value={currentVal}
                              onChange={(e) => setStatusDrafts(prev => ({ ...prev, [order.id]: e.target.value }))}
                              className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer ${
                                currentVal === 'Delivered' ? 'bg-green-50 text-green-800 border-green-200' :
                                currentVal === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                currentVal === 'Cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                                'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            {hasChanged && (
                              <button
                                onClick={async () => {
                                  await handleUpdateOrderStatus(order.id, currentVal);
                                  setStatusDrafts(prev => {
                                    const next = { ...prev };
                                    delete next[order.id];
                                    return next;
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center cursor-pointer animate-pulse"
                                title="Confirm status update"
                              >
                                OK
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingProduct ? 'Edit Tomato Product' : 'Add New Tomato Variety'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Organic Roma Plum Tomatoes"
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Variety</label>
                  <input
                    required
                    type="text"
                    placeholder="Roma, Cherry, etc."
                    value={productForm.variety}
                    onChange={(e) => setProductForm({ ...productForm, variety: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price per kg (Rs.)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="180"
                    value={productForm.price_per_unit}
                    onChange={(e) => setProductForm({ ...productForm, price_per_unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Initial Stock (kg)</label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    placeholder="25.0"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={productForm.is_active}
                    onChange={(e) => setProductForm({ ...productForm, is_active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Description of this variety..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
