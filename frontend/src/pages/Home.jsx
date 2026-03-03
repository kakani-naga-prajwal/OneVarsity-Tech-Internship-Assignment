import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import ProductGrid from '../components/ProductGrid';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';
// Frontend fallback analytics for admin overview (no backend required), per-year
const ADMIN_STATS_BY_YEAR = {
  2026: {
    totalRevenue: 892500,
    totalOrders: 235,
    avgOrderValue: 892500 / 235,
    profit: -42000,
    paymentBreakdown: [
      { name: 'Card', value: 55 },
      { name: 'UPI', value: 30 },
      { name: 'COD', value: 15 },
    ],
    byCategory: [
      { name: 'Electronics', revenue: 420000 },
      { name: 'Fashion', revenue: 180000 },
      { name: 'Home & Living', revenue: 150000 },
      { name: 'Beauty', revenue: 142500 },
    ],
    monthly: [
      { month: 'Jan', sales: 62000, orders: 28 },
      { month: 'Feb', sales: 58000, orders: 25 },
      { month: 'Mar', sales: 78000, orders: 32 },
      { month: 'Apr', sales: 85000, orders: 36 },
      { month: 'May', sales: 71000, orders: 30 },
      { month: 'Jun', sales: 82000, orders: 34 },
      { month: 'Jul', sales: 95000, orders: 40 },
      { month: 'Aug', sales: 98000, orders: 42 },
      { month: 'Sep', sales: 76000, orders: 31 },
      { month: 'Oct', sales: 102000, orders: 44 },
      { month: 'Nov', sales: 115000, orders: 48 },
      { month: 'Dec', sales: 128000, orders: 52 },
    ],
  },
  2025: {
    totalRevenue: 725400,
    totalOrders: 198,
    avgOrderValue: 725400 / 198,
    profit: 15000,
    paymentBreakdown: [
      { name: 'Card', value: 50 },
      { name: 'UPI', value: 35 },
      { name: 'COD', value: 15 },
    ],
    byCategory: [
      { name: 'Electronics', revenue: 330000 },
      { name: 'Fashion', revenue: 160000 },
      { name: 'Home & Living', revenue: 120000 },
      { name: 'Beauty', revenue: 115400 },
    ],
    monthly: [
      { month: 'Jan', sales: 52000, orders: 22 },
      { month: 'Feb', sales: 48000, orders: 20 },
      { month: 'Mar', sales: 68000, orders: 28 },
      { month: 'Apr', sales: 72000, orders: 30 },
      { month: 'May', sales: 61000, orders: 26 },
      { month: 'Jun', sales: 74000, orders: 31 },
      { month: 'Jul', sales: 82000, orders: 35 },
      { month: 'Aug', sales: 85000, orders: 36 },
      { month: 'Sep', sales: 65000, orders: 27 },
      { month: 'Oct', sales: 88000, orders: 37 },
      { month: 'Nov', sales: 98000, orders: 41 },
      { month: 'Dec', sales: 108000, orders: 45 },
    ],
  },
  2024: {
    totalRevenue: 598750,
    totalOrders: 165,
    avgOrderValue: 598750 / 165,
    profit: 32000,
    paymentBreakdown: [
      { name: 'Card', value: 48 },
      { name: 'UPI', value: 37 },
      { name: 'COD', value: 15 },
    ],
    byCategory: [
      { name: 'Electronics', revenue: 260000 },
      { name: 'Fashion', revenue: 140000 },
      { name: 'Home & Living', revenue: 100000 },
      { name: 'Beauty', revenue: 98750 },
    ],
    monthly: [
      { month: 'Jan', sales: 42000, orders: 18 },
      { month: 'Feb', sales: 39000, orders: 17 },
      { month: 'Mar', sales: 56000, orders: 23 },
      { month: 'Apr', sales: 61000, orders: 26 },
      { month: 'May', sales: 52000, orders: 22 },
      { month: 'Jun', sales: 64000, orders: 27 },
      { month: 'Jul', sales: 72000, orders: 30 },
      { month: 'Aug', sales: 75000, orders: 32 },
      { month: 'Sep', sales: 56000, orders: 24 },
      { month: 'Oct', sales: 78000, orders: 33 },
      { month: 'Nov', sales: 88000, orders: 37 },
      { month: 'Dec', sales: 96000, orders: 40 },
    ],
  },
};

const PIE_COLORS = ['#6366f1', '#06b6d4', '#f97316', '#ef4444'];

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const stats = ADMIN_STATS_BY_YEAR[selectedYear] || ADMIN_STATS_BY_YEAR[2026];
      setMonthlySales(stats.monthly);
      setAdminStats({
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        avgOrderValue: stats.avgOrderValue,
        profit: stats.profit,
        paymentBreakdown: stats.paymentBreakdown,
        byCategory: stats.byCategory,
      });
      setCategories(stats.byCategory.map((c) => ({ id: c.name.toLowerCase().replace(/\s+/g, '-'), name: c.name })));
    }
  }, [user, selectedYear]);

  // Fetch categories from the database
  useEffect(() => {
    api
      .get('/categories')
      .then(({ data }) => data.success && setCategories(data.data || []))
      .catch(() => {
        // Fallback categories if API fails
        setCategories([
          { id: 'electronics', name: 'Electronics' },
          { id: 'fashion', name: 'Fashion' },
          { id: 'home-living', name: 'Home & Living' },
          { id: 'beauty', name: 'Beauty' },
        ]);
      });
  }, []);

  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    // Fetch real featured products
    api.get('/products', { params: { limit: 4 } })
      .then(res => {
        setFeatured(res.data?.data || []);
      })
      .catch((err) => {
        console.warn('Failed to load featured products, using fallback', err);
        // Fallback to first 4 fallback products when backend unavailable
        setFeatured(FALLBACK_PRODUCTS.slice(0, 4));
      });
  }, []);

  // Helper that returns an inline SVG placeholder data URL when an image is missing
  const getCategoryPlaceholder = (label, idx) => {
    const colors = {
      Electronics: '#fde68a',
      Fashion: '#fee2e2',
      'Home & Living': '#dbeafe',
      Beauty: '#d1fae5',
    };
    const bg = colors[label] || '#e2e8f0';
    const text = `${label} ${idx + 1}`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'><rect fill='${bg}' width='400' height='400'/><text x='50%' y='50%' font-size='28' fill='#0f172a' text-anchor='middle' dominant-baseline='middle' font-family='Inter, Arial, sans-serif'>${text}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  // Static images for the "Discover more" gallery so it never looks empty
  const discoverSections = [
    {
      id: 'gallery-electronics',
      label: 'Electronics',
      images: [
        '/images/headphones.png',
        '/images/headphones.png',
        '/images/headphones.png',
        '/images/headphones.png',
        '/images/headphones.png',
        '/images/headphones.png',
      ],
    },
    {
      id: 'gallery-fashion',
      label: 'Fashion',
      images: [
        '/images/sneakers.png',
        '/images/watch.png',
        '/images/hoodie.png',
        '/images/sneakers.png',
        '/images/watch.png',
        '/images/hoodie.png',
      ],
    },
    {
      id: 'gallery-home',
      label: 'Home & Living',
      images: [
        '/images/couch.svg',
        '/images/chair.svg',
        '/images/vase.svg',
        '/images/couch.svg',
        '/images/chair.svg',
        '/images/couch.svg',
      ],
    },
    {
      id: 'gallery-beauty',
      label: 'Beauty',
      images: [
        '/images/skincare.svg',
        '/images/makeup.svg',
        '/images/phone.svg',
        '/images/skincare.svg',
        '/images/makeup.svg',
        '/images/skincare.svg',
      ],
    },
  ];

  const helpItems = [
    {
      id: 'shipping',
      q: 'How long does shipping take?',
      a: 'Standard delivery is 3–5 business days. Express options available at checkout.',
    },
    {
      id: 'returns',
      q: 'What is your return policy?',
      a: 'You can return unused items within 30 days with receipt. Refunds are processed within 5–7 business days.',
    },
    {
      id: 'payment',
      q: 'What payment methods do you accept?',
      a: 'We accept major cards, UPI, and wallets. Payments are processed securely.',
    },
    {
      id: 'tracking',
      q: 'How can I track my order?',
      a: 'Once your order ships, you’ll receive an email with a tracking link. You can also view status in My Orders.',
    },
    {
      id: 'contact',
      q: 'How do I contact support?',
      a: 'Email us at support@megamart.example.com or use the live chat on this page. We reply within 24 hours.',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-hero border border-primary-300/60 shadow-card-hover mb-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%236366f1\' fill-opacity=\'0.10\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'1.5\'/%3E%3Ccircle cx=\'40\' cy=\'30\' r=\'1.5\'/%3E%3Ccircle cx=\'70\' cy=\'50\' r=\'1.5\'/%3E%3Ccircle cx=\'25\' cy=\'60\' r=\'1.5\'/%3E%3Ccircle cx=\'55\' cy=\'15\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-70" />
        <div className="relative px-6 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 animate-fade-in-up">
            Shop smart. Order simple.
          </h1>
          <p className="text-slate-700 text-lg max-w-2xl mx-auto mb-8">
            Discover products, add to cart, and checkout in minutes. Fast delivery and easy returns.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/products"
              className="btn-primary text-lg px-8 py-3.5 shadow-lg hover:shadow-xl transition-shadow"
            >
              Shop now
            </Link>
            {!user && (
              <Link to="/register" className="btn-secondary text-lg px-8 py-3.5">
                Create account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Admin: Monthly sales + profile (visible only when admin is logged in) */}
      {user?.role === 'admin' && (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Admin overview</h2>
              <p className="text-sm text-slate-500">Snapshot of sales, users and performance</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="input">
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
              </select>
            </div>
          </div>

          {/* Overall earnings */}
          {adminStats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="card p-4">
                <p className="text-slate-500 text-sm font-medium">Total revenue (all products)</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{Number(adminStats.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-slate-500 text-sm font-medium">Total orders</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {adminStats.totalOrders ?? 0}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-slate-500 text-sm font-medium">Profit (net)</p>
                <p className={`text-2xl font-bold mt-1 ${adminStats.profit < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {adminStats.profit < 0 ? '-' : ''}₹{Math.abs(adminStats.profit || 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Monthly sales chart */}
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-slate-800 mb-4">Sales by month</h3>
            {monthlySales.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlySales}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) =>
                        v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`
                      }
                    />
                    <Tooltip
                      formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Sales']}
                    />
                    <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-500 py-8 text-center">
                No sales data yet. Orders will appear here once placed.
              </p>
            )}

            {/* Payment method breakdown (pie) and revenue by category (bar) */}
            {adminStats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="card p-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Payment methods</h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={adminStats.paymentBreakdown} dataKey="value" nameKey="name" outerRadius={80} innerRadius={36} label>
                          {adminStats.paymentBreakdown.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card p-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-3">Revenue by category</h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={adminStats.byCategory} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`)} />
                        <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin profile card with details */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-primary-600">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">{user?.name}</h3>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium">
                    Admin
                  </span>
                </div>
              </div>
              <Link to="/admin" className="btn-primary">
                Go to Dashboard
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 font-medium">Email</p>
                <p className="text-slate-800">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Phone</p>
                <p className="text-slate-800">{user?.phone || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Nationality</p>
                <p className="text-slate-800">{user?.nationality || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Gender</p>
                <p className="text-slate-800 capitalize">{user?.gender || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories (static, no backend dependency) */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Shop by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              className="card-hover p-6 text-center opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary-100 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-slate-900">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p, i) => (
              <div
                key={p.id}
                className="card-hover overflow-hidden opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <Link to={`/products/${p.id}`} className="block aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={p.image_url || 'https://picsum.photos/400/400?random=999'}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://picsum.photos/400/400?random=111'; }}
                  />
                </Link>
                <div className="p-4 flex flex-col">
                  <Link to={`/products/${p.id}`} className="font-semibold text-slate-900 truncate hover:text-primary-600">
                    {p.name}
                  </Link>
                  <p className="text-primary-600 font-bold mt-1">₹{Number(p.price).toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-2">🚚 Delivery within 2 days</p>
                  <button
                    onClick={async () => {
                      const result = await addToCart(p, 1);
                      if (result.success) {
                        navigate('/cart');
                      }
                    }}
                    className="btn-primary mt-3 w-full text-sm"
                    disabled={p.stock === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href="#all-products" className="btn-secondary">
              View all products
            </a>
          </div>
        </section>
      )}

      <section id="all-products" className="mb-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Discover more</h2>
        <ProductGrid />
      </section>

      {/* Help Centre */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">Help Centre</h2>
        <p className="text-stone-600 mb-6">
          Quick answers to common questions. Can’t find what you need? Contact our support team.
        </p>
        <div className="space-y-2">
          {helpItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-stone-200 overflow-hidden bg-stone-50/50"
            >
              <button
                onClick={() =>
                  setHelpOpen(helpOpen === item.id ? null : item.id)
                }
                className="w-full px-4 py-3 text-left font-medium text-stone-800 flex justify-between items-center hover:bg-stone-100/80 transition-colors"
              >
                {item.q}
                <span
                  className={`text-stone-400 transition-transform ${helpOpen === item.id ? 'rotate-180' : ''
                    }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              {helpOpen === item.id && (
                <div className="px-4 pb-3 pt-0 text-stone-600 text-sm border-t border-stone-200/80 animate-fade-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <a
            href="mailto:support@megamart.example.com"
            className="text-primary-600 font-medium hover:underline"
          >
            Email support
          </a>
          <span className="text-stone-400">|</span>
          <span className="text-stone-500">Live chat: Mon–Fri 9am–6pm</span>
        </div>
      </section>
    </div>
  );
}

