import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
// offline/demo support
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      // offline/demo: always read from localStorage (user must be logged in via ProtectedRoute)
      let stored = localStorage.getItem('userOrders');
      let list = stored ? JSON.parse(stored) : [];
      if (!list.length) {
        list = generateFallbackCustomerOrders();
        localStorage.setItem('userOrders', JSON.stringify(list));
      }
      setOrders(list);
      setLoading(false);

      // optional: try to sync from backend but ignore errors
      try {
        const res = await api.get('/orders');
        if (res.data?.data?.length) {
          setOrders(res.data.data);
        }
      } catch (_) {}
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-700">No orders yet</h2>
        <Link to="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="card p-4 flex flex-wrap justify-between items-center hover:shadow-md transition-shadow block"
          >
            <div>
              <span className="font-mono font-medium">{order.order_number}</span>
              <span className="ml-3 text-slate-600">₹{Number(order.total_amount).toFixed(2)}</span>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <span className={`px-2 py-1 rounded text-sm font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                }`}>
                {order.status}
              </span>
              {order.payment_method === 'cod' ? (
                <span className="px-2 py-1 rounded text-sm bg-amber-100 text-amber-800">COD</span>
              ) : (
                <span className={`px-2 py-1 rounded text-sm ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.payment_status}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// helper to generate demo orders when storage is empty
function generateFallbackCustomerOrders() {
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
