import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
// Use frontend fallback analytics so dashboard works offline

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    byMonth: [],
    byStatus: [],
    byCategory: [],
    paymentBreakdown: [],
  });

  // simple frontend fallback analytics (same style as Home.jsx)
  const FALLBACK_ANALYTICS = {
    2026: {
      totalRevenue: 892500,
      totalOrders: 235,
      avgOrderValue: 892500 / 235,
      profit: -42000,
      byMonth: [
        { month: 'Jan', sales: 62000 }, { month: 'Feb', sales: 58000 }, { month: 'Mar', sales: 78000 }, { month: 'Apr', sales: 85000 }, { month: 'May', sales: 71000 }, { month: 'Jun', sales: 82000 }, { month: 'Jul', sales: 95000 }, { month: 'Aug', sales: 98000 }, { month: 'Sep', sales: 76000 }, { month: 'Oct', sales: 102000 }, { month: 'Nov', sales: 115000 }, { month: 'Dec', sales: 128000 }
      ],
      byStatus: [
        { status: 'pending', count: 18 }, { status: 'confirmed', count: 52 }, { status: 'shipped', count: 63 }, { status: 'delivered', count: 78 }, { status: 'cancelled', count: 24 }
      ],
      byCategory: [
        { category: 'Electronics', revenue: 420000 }, { category: 'Fashion', revenue: 180000 }, { category: 'Home & Living', revenue: 150000 }, { category: 'Beauty', revenue: 142500 }
      ],
      paymentBreakdown: [
        { name: 'Card', value: 55 }, { name: 'UPI', value: 30 }, { name: 'COD', value: 15 }
      ]
    },
    2025: {
      totalRevenue: 725400,
      totalOrders: 198,
      avgOrderValue: 725400 / 198,
      profit: 15000,
      byMonth: [
        { month: 'Jan', sales: 52000 }, { month: 'Feb', sales: 48000 }, { month: 'Mar', sales: 68000 }, { month: 'Apr', sales: 72000 }, { month: 'May', sales: 61000 }, { month: 'Jun', sales: 74000 }, { month: 'Jul', sales: 82000 }, { month: 'Aug', sales: 85000 }, { month: 'Sep', sales: 65000 }, { month: 'Oct', sales: 88000 }, { month: 'Nov', sales: 98000 }, { month: 'Dec', sales: 108000 }
      ],
      byStatus: [ { status: 'pending', count: 15 }, { status: 'confirmed', count: 40 }, { status: 'shipped', count: 55 }, { status: 'delivered', count: 70 }, { status: 'cancelled', count: 18 } ],
      byCategory: [ { category: 'Electronics', revenue: 330000 }, { category: 'Fashion', revenue: 160000 }, { category: 'Home & Living', revenue: 120000 }, { category: 'Beauty', revenue: 115400 } ],
      paymentBreakdown: [ { name: 'Card', value: 50 }, { name: 'UPI', value: 35 }, { name: 'COD', value: 15 } ]
    },
    2024: {
      totalRevenue: 598750,
      totalOrders: 165,
      avgOrderValue: 598750 / 165,
      profit: 32000,
      byMonth: [ { month: 'Jan', sales: 42000 }, { month: 'Feb', sales: 39000 }, { month: 'Mar', sales: 56000 }, { month: 'Apr', sales: 61000 }, { month: 'May', sales: 52000 }, { month: 'Jun', sales: 64000 }, { month: 'Jul', sales: 72000 }, { month: 'Aug', sales: 75000 }, { month: 'Sep', sales: 56000 }, { month: 'Oct', sales: 78000 }, { month: 'Nov', sales: 88000 }, { month: 'Dec', sales: 96000 } ],
      byStatus: [ { status: 'pending', count: 12 }, { status: 'confirmed', count: 30 }, { status: 'shipped', count: 40 }, { status: 'delivered', count: 60 }, { status: 'cancelled', count: 23 } ],
      byCategory: [ { category: 'Electronics', revenue: 260000 }, { category: 'Fashion', revenue: 140000 }, { category: 'Home & Living', revenue: 100000 }, { category: 'Beauty', revenue: 98750 } ],
      paymentBreakdown: [ { name: 'Card', value: 48 }, { name: 'UPI', value: 37 }, { name: 'COD', value: 15 } ]
    }
  };

  useEffect(() => {
    const stats = FALLBACK_ANALYTICS[selectedYear] || FALLBACK_ANALYTICS[2026];
    setAnalytics({
      totalOrders: stats.totalOrders,
      totalRevenue: stats.totalRevenue,
      byMonth: stats.byMonth,
      byStatus: stats.byStatus,
      byCategory: stats.byCategory,
      paymentBreakdown: stats.paymentBreakdown,
    });
  }, [selectedYear]);

  const profit = Math.round((analytics.totalRevenue || 0) * 0.3);
  const profitColor = profit >= 0 ? 'text-emerald-600' : 'text-rose-600';

  const pieColors = ['#f97316', '#60a5fa', '#34d399', '#f472b6', '#a78bfa'];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of sales, orders and categories ({selectedYear})</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="input">
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-slate-500 text-sm font-medium">Total revenue</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{Number(analytics.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-sm font-medium">Total orders</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.totalOrders ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-sm font-medium">Estimated profit</p>
          <p className={`text-2xl font-bold mt-1 ${profitColor}`}>₹{Number(profit).toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-sm font-medium">Avg order value</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">₹{Math.round((analytics.totalRevenue || 0) / (analytics.totalOrders || 1)).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold mb-3">Sales by month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.byMonth || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`)} />
                <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Sales']} />
                <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-3">Orders by status</h3>
          <div className="flex gap-4 items-center">
            <div className="w-36 h-36 border border-slate-100 rounded-full flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.byStatus || []} dataKey="count" nameKey="status" outerRadius={56} innerRadius={28}>
                    {(analytics.byStatus || []).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <ul className="space-y-2">
                {(analytics.byStatus || []).map((s, idx) => (
                  <li key={s.status} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: pieColors[idx % pieColors.length] }} />
                      <span className="capitalize text-slate-700">{s.status}</span>
                    </div>
                    <span className="font-medium text-slate-900">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-3">Sales by Category</h3>
          <div className="flex gap-4 items-center">
            <div className="w-36 h-36 border border-slate-100 rounded-full flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.byCategory || []} dataKey="revenue" nameKey="category" outerRadius={56} innerRadius={28}>
                    {(analytics.byCategory || []).map((entry, idx) => (
                      <Cell key={`cell-cat-${idx}`} fill={pieColors[(idx + 2) % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <ul className="space-y-2">
                {(analytics.byCategory || []).map((c, idx) => (
                  <li key={c.category} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: pieColors[(idx + 2) % pieColors.length] }} />
                      <span className="capitalize text-slate-700">{c.category}</span>
                    </div>
                    <span className="font-medium text-slate-900">₹{Math.round(c.revenue).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex gap-4">
        <Link to="/admin/products" className="btn-primary">Manage Products</Link>
        <Link to="/admin/orders" className="btn-secondary">View Orders</Link>
        <Link to="/admin/users" className="btn-secondary">View Users</Link>
      </nav>
    </div>
  );
}
