import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, AlertTriangle, CheckCircle, Sparkles, Truck, ShieldCheck, Leaf, ArrowUpDown, X, Star } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart();
  const [addedNotice, setAddedNotice] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [selectedVariety]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = '/api/products';
      const params = {};
      if (selectedVariety !== 'All') {
        params.variety = selectedVariety;
      }
      const response = await api.get(url, { params });
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Could not load tomato products. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (productId, val, maxStock) => {
    const num = Math.max(1, Math.min(Number(val) || 1, maxStock));
    setQuantities(prev => ({ ...prev, [productId]: num }));
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    addToCart(product, qty);
    setAddedNotice({
      title: product.title,
      qty: qty,
      time: Date.now()
    });
    setTimeout(() => setAddedNotice(null), 3000);
  };

  const varieties = [
    { name: 'All', label: 'All Varieties' },
    { name: 'Cherry', label: 'Cherry Tomatoes' },
    { name: 'Roma', label: 'Roma Plum' },
    { name: 'Beefsteak', label: 'Giant Beefsteak' },
    { name: 'Heirloom', label: 'Heritage Heirloom' },
    { name: 'Campari', label: 'Campari On-Vine' },
    { name: 'Green Standard', label: 'Green Tomatoes' },
  ];

  const getVarietyCount = (name) => {
    if (name === 'All') return products.length;
    return products.filter(p => p.variety.toLowerCase().includes(name.toLowerCase())).length;
  };

  // Filtering
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price_per_unit - b.price_per_unit;
    if (sortBy === 'price-high') return b.price_per_unit - a.price_per_unit;
    if (sortBy === 'stock-high') return b.stock_quantity - a.stock_quantity;
    return a.id - b.id;
  });

  return (
    <div className="min-h-screen bg-rose-50/30 pb-20">
      {/* Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900/95 backdrop-blur text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-stone-700/50 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Added to Cart</div>
            <div className="text-sm font-bold text-white">{addedNotice.qty} kg × {addedNotice.title}</div>
          </div>
        </div>
      )}

      {/* Vibrant Tomato-Red & Fresh Produce Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white pt-14 pb-18 px-4 overflow-hidden shadow-lg">
        {/* Ambient glows and highlights */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 border border-white/30 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Farm-To-Table Fresh Organic Produce</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15] text-white drop-shadow-sm">
            Hand-Harvested <span className="text-amber-200">Fresh Tomatoes</span>, Straight From The Vine.
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-rose-100 max-w-2xl mx-auto font-medium leading-relaxed">
            Order premium Roma, Cherry, Beefsteak, and Heirloom varieties delivered directly from local farm greenhouses at peak ripeness.
          </p>

          {/* Trust Highlights */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-rose-100 font-semibold">
            <span className="flex items-center space-x-1.5 bg-black/15 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20">
              <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              <span>100% Pesticide-Free</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-black/15 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20">
              <Truck className="w-3.5 h-3.5 text-amber-200" />
              <span>Free Delivery Over Rs. 500</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-black/15 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Farm-Fresh Guaranteed</span>
            </span>
          </div>

          {/* Prominent High-Contrast Floating Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative bg-white rounded-2xl p-2 shadow-2xl border border-rose-100 flex items-center transition focus-within:ring-4 focus-within:ring-white/40">
              <Search className="w-5 h-5 text-rose-500 ml-3 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search tomatoes by variety (Cherry, Roma, Beefsteak, Heirloom)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none text-sm font-semibold bg-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-stone-400 hover:text-stone-600 transition mr-2 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="pr-1">
                <button
                  type="button"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>Search</span>
                </button>
              </div>
            </div>

            {/* Quick search tags */}
            <div className="mt-3 flex items-center justify-center flex-wrap gap-2 text-xs text-rose-200">
              <span className="font-bold text-white">Popular Varieties:</span>
              {['Cherry', 'Beefsteak', 'Roma', 'Heirloom'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="bg-white/15 hover:bg-white/25 text-white px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer border border-white/20"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Controls: Variety Filters & Sorter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          {/* Variety Filter Tabs */}
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
            {varieties.map((v) => {
              const isActive = selectedVariety === v.name;
              const count = getVarietyCount(v.name);
              return (
                <button
                  key={v.name}
                  onClick={() => setSelectedVariety(v.name)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30 scale-105 border-transparent'
                      : 'bg-white text-stone-700 hover:bg-rose-50 hover:text-red-700 border border-rose-200/70 shadow-xs'
                  }`}
                >
                  {v.name === 'All' && <span className="text-sm">🍅</span>}
                  <span>{v.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white/25 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sorter & Results Counter */}
          <div className="flex items-center justify-between sm:justify-end space-x-3 text-xs text-stone-500 font-medium">
            <span className="font-bold text-stone-700">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'Variety' : 'Varieties'} Available
            </span>
            <div className="flex items-center space-x-1.5 bg-white border border-rose-100 rounded-xl px-3 py-1.5 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-rose-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-700 focus:outline-none cursor-pointer"
              >
                <option value="default">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock-high">Stock Available</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-8 text-sm flex items-center space-x-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="text-sm font-semibold text-stone-500">Loading fresh produce catalog...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-sm p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🍅
            </div>
            <h3 className="text-lg font-bold text-stone-900">No matching varieties found</h3>
            <p className="mt-1 text-sm text-stone-500">
              Try adjusting your search query or reset your filter.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedVariety('All'); }}
              className="mt-5 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Products Grid: Gourmet Produce Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {sortedProducts.map((product) => {
              const isOutOfStock = product.stock_quantity <= 0;
              const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 10.0;
              const currentQty = quantities[product.id] || 1;
              const stockPercentage = Math.min(100, Math.round((product.stock_quantity / 50) * 100));

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-rose-100/90 hover:border-red-400 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-sm hover:-translate-y-1"
                >
                  <div>
                    {/* Product Image Container */}
                    <div className="relative h-56 w-full bg-rose-50 overflow-hidden">
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'}
                        alt={product.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />

                      {/* Glassmorphic Variety Tag */}
                      <div className="absolute top-3.5 left-3.5">
                        <span className="bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border border-white/20">
                          {product.variety}
                        </span>
                      </div>

                      {/* Stock Status Badges */}
                      <div className="absolute top-3.5 right-3.5">
                        {isOutOfStock ? (
                          <span className="bg-stone-900/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur">
                            Sold Out
                          </span>
                        ) : isLowStock ? (
                          <span className="bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center space-x-1 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Only {product.stock_quantity} kg left!</span>
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                            <span>In Stock: {product.stock_quantity} kg</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          Organic Certified
                        </span>
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-current mr-1" />
                          <span className="text-stone-700">4.9</span>
                        </div>
                      </div>

                      <h3 className="mt-2 text-lg font-bold text-stone-900 group-hover:text-red-600 transition-colors leading-snug">
                        {product.title}
                      </h3>

                      <p className="mt-2 text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {product.description || 'Farm-fresh hydroponically harvested ripe tomatoes.'}
                      </p>

                      {/* Stock Health Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                          <span className="text-stone-400">Available Fresh Stock</span>
                          <span className={isLowStock ? 'text-amber-600 font-bold' : 'text-stone-600 font-bold'}>
                            {product.stock_quantity} kg
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isOutOfStock
                                ? 'bg-stone-300 w-0'
                                : isLowStock
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(5, stockPercentage)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Add To Cart Footer */}
                  <div className="px-6 pb-6 pt-2">
                    <div className="pt-4 border-t border-rose-50 flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-black text-red-600">
                          Rs. {product.price_per_unit}
                        </span>
                        <span className="text-xs text-stone-500 font-bold ml-1">/ kg</span>
                      </div>
                      <span className="text-[11px] text-stone-400 font-medium">Pack: 1 kg</span>
                    </div>

                    {!isOutOfStock ? (
                      <div className="flex items-center space-x-2">
                        {/* Stepper */}
                        <div className="flex items-center border border-rose-200 rounded-2xl overflow-hidden bg-rose-50/50 p-0.5">
                          <button
                            onClick={() => handleQtyChange(product.id, currentQty - 1, product.stock_quantity)}
                            className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-white rounded-xl transition font-black text-base cursor-pointer"
                            title="Decrease kg"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={product.stock_quantity}
                            value={currentQty}
                            onChange={(e) => handleQtyChange(product.id, e.target.value, product.stock_quantity)}
                            className="w-10 text-center text-xs font-bold bg-transparent focus:outline-none text-stone-800"
                          />
                          <button
                            onClick={() => handleQtyChange(product.id, currentQty + 1, product.stock_quantity)}
                            className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-white rounded-xl transition font-black text-base cursor-pointer"
                            title="Increase kg"
                          >
                            +
                          </button>
                        </div>

                        {/* Add to Cart CTA */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-red-600/20 hover:shadow-lg transition cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-stone-100 text-stone-400 py-3 rounded-2xl text-xs font-bold cursor-not-allowed border border-stone-200"
                      >
                        Currently Out of Stock
                      </button>
                    )}
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

export default Catalog;
