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
} from 'recharts';
import api from '../../api/axios';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [analytics, setAnalytics] = useState({ totalOrders: 0, totalRevenue: 0, byMonth: [] });
  const [loading, setLoading] = useState(true);

  // offline/demo fallback for admin orders and analytics
  const fetchDashboardData = async () => {
    // read from userOrders storage (customer orders) as our source
    let stored = localStorage.getItem('userOrders');
    let list = stored ? JSON.parse(stored) : [];
    if (!list.length) {
      // reuse generator from customer page
      list = generateFallbackCustomerOrders();
      localStorage.setItem('userOrders', JSON.stringify(list));
    }
    // filter by status if requested
    const filtered = statusFilter ? list.filter(o => o.status === statusFilter) : list;
    setOrders(filtered);

    // compute analytics
    const totalOrders = list.length;
    const totalRevenue = list.reduce((s,o) => s + Number(o.total_amount || 0), 0);
    const byMonth = [];
    list.forEach(o => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const existing = byMonth.find(m => m.month === key);
      const amt = Number(o.total_amount || 0);
      if (existing) existing.sales += amt;
      else byMonth.push({ month: key, sales: amt });
    });

    setAnalytics({ totalOrders, totalRevenue, byMonth });

    // still try backend for sync, ignore errors
    try {
      const [ordersRes, analyticsRes, monthlyRes] = await Promise.all([
        api.get('/admin/orders', { params: { status: statusFilter || undefined, limit: 50 } }),
        api.get('/admin/analytics'),
        api.get('/admin/analytics/monthly'),
      ]);

      if (ordersRes.data?.data) setOrders(ordersRes.data.data);
      if (analyticsRes.data?.data) {
        setAnalytics(prev => ({
          ...prev,
          totalOrders: analyticsRes.data.data.totalOrders || prev.totalOrders,
          totalRevenue: analyticsRes.data.data.totalRevenue || prev.totalRevenue,
        }));
      }
      if (monthlyRes.data?.data) setAnalytics(prev => ({ ...prev, byMonth: monthlyRes.data.data }));
    } catch (err) {
      console.error('Failed to fetch admin orders/analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, [statusFilter]);

  // reuse same fallback order generator used for customer pages
  function generateFallbackCustomerOrders() {
    // avoid importing to reduce coupling, replicate minimal logic
    const FALLBACK_PRODUCTS = require('../../data/fallbackProducts').FALLBACK_PRODUCTS;
    const orders = [];
    for (let i = 1; i <= 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * 3);
      const items = [];
      const count = 1 + (i % 3);
      for (let j = 0; j < count; j++) {
        const prod = FALLBACK_PRODUCTS[(i + j) % FALLBACK_PRODUCTS.length];
        items.push({
          id: j + 1,
          Product: prod,
          quantity: 1,
          price: prod.price,
        });
      }
      const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
      const status = ['pending', 'confirmed', 'delivered', 'cancelled'][i % 4];
      const pay = i % 2 === 0 ? 'paid' : 'unpaid';
      orders.push({
        id: `fb-order-${i}`,
        order_number: `ORD-${date.getFullYear()}-${String(1000 + i).slice(-4)}`,
        total_amount: total,
        status,
        payment_status: pay,
        OrderItems: items,
        created_at: date.toISOString(),
      });
    }
    return orders;
  }
  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders & Analytics</h1>
          <p className="text-sm text-slate-500">Overview of orders and revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin" className="btn-secondary">← Dashboard</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-slate-500 text-sm">Total orders</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{analytics.totalOrders}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-sm">Total revenue</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{Number(analytics.totalRevenue).toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-slate-500 text-sm">Avg order value</p>
          <p className="text-2xl font-bold text-primary-600 mt-1">₹{Math.round((analytics.totalRevenue || 0) / (analytics.totalOrders || 1)).toLocaleString()}</p>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-3">Monthly sales</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.byMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`)} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Sales']} />
              <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input max-w-[200px]"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3">Order #</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-100">
                  <td className="p-3 font-mono text-sm">
                    <Link to={`/orders/${order.id}`} className="text-primary-600 hover:underline">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="p-3">₹{Number(order.total_amount).toFixed(2)}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-sm bg-slate-100">{order.status}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
