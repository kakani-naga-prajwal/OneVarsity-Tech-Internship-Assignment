import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
// demo/offline utilities
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

export default function OrderDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const [returnTx, setReturnTx] = useState('');
  const [returnProductId, setReturnProductId] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnMessage, setReturnMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    const fetchOrder = async () => {
      // if navigation passed order data, use it immediately
      // (helps avoid "not found" when coming straight from checkout)
      const fromNav = location.state?.order;
      if (fromNav) {
        setOrder(fromNav);
        setLoading(false);
        return;
      }

      // try local storage first
      let stored = localStorage.getItem('userOrders');
      let list = stored ? JSON.parse(stored) : [];
      let found = list.find((o) => o.id === id);
      if (!found && !list.length) {
        // generate demo orders if none exist
        list = generateFallbackCustomerOrders();
        localStorage.setItem('userOrders', JSON.stringify(list));
        found = list.find((o) => o.id === id);
      }
      if (found) {
        setOrder(found);
        setLoading(false);
        return;
      }

      // fallback to backend if not in local data
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data?.data || null);
      } catch (err) {
        console.error('Failed to fetch order', err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    // always fetch order regardless of user variable; route is protected so user exists
    fetchOrder();
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    try {
      // offline: mark order as paid in storage
      let stored = localStorage.getItem('userOrders');
      if (stored) {
        const list = JSON.parse(stored);
        const idx = list.findIndex((o) => o.id === id);
        if (idx >= 0) {
          list[idx].payment_status = 'paid';
          localStorage.setItem('userOrders', JSON.stringify(list));
          setOrder(list[idx]);
        }
      }
      // also try backend sync but ignore errors
      await api.post(`/orders/${id}/pay`).catch(() => {});
    } catch (err) {
      console.error('Payment simulation failed', err);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Order not found.</p>
        <Link to="/orders" className="btn-primary mt-4 inline-block">Back to orders</Link>
      </div>
    );
  }

  // show success message if passed from checkout
  const successBanner = location.state?.success ? (
    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">Order placed successfully!</div>
  ) : null;

  const items = order.OrderItems || [];

  return (
    <div>
      <Link to="/orders" className="text-primary-600 hover:underline mb-4 inline-block">← Back to Orders</Link>
      {returnMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{returnMessage}</div>
      )}
      {successBanner}
      <h1 className="text-2xl font-bold mb-2">Order {order.order_number}</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        <span className={`px-2 py-1 rounded text-sm font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-slate-100 text-slate-800'
          }`}>
          {order.status}
        </span>
        <span className={`px-2 py-1 rounded text-sm ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}>
          {order.payment_status}
        </span>
      </div>
      <div className="card overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-right p-3">Qty</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((oi) => (
              <tr key={oi.id} className="border-t border-slate-100">
                <td className="p-3">{oi.Product?.name}</td>
                <td className="p-3 text-right">{oi.quantity}</td>
                <td className="p-3 text-right">₹{Number(oi.price).toFixed(2)}</td>
                <td className="p-3 text-right">₹{(oi.quantity * Number(oi.price)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Return request section */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-3">Request a return</h3>
        <p className="text-sm text-slate-600 mb-3">Provide the transaction number and details for the product you want to return.</p>
        <form onSubmit={async (e) => {
          e.preventDefault();
          // basic validation
          if (!returnTx.trim()) return alert('Please enter transaction number');
          if (!returnProductId) return alert('Please select product to return');
          if (!receivedDate) return alert('Please enter date you received the product');
          if (!returnReason.trim()) return alert('Please provide a reason for return');

          setReturnSubmitting(true);
          try {
            const stored = localStorage.getItem('returnRequests');
            const list = stored ? JSON.parse(stored) : [];
            const req = {
              id: `ret-${Date.now()}`,
              orderId: order.id,
              order_number: order.order_number,
              productId: returnProductId,
              transactionNumber: returnTx.trim(),
              receivedDate,
              reason: returnReason.trim(),
              status: 'requested',
              created_at: new Date().toISOString(),
            };
            list.unshift(req);
            localStorage.setItem('returnRequests', JSON.stringify(list));
            setReturnMessage('Return request submitted — we will contact you soon.');
            // clear form
            setReturnTx(''); setReturnProductId(''); setReceivedDate(''); setReturnReason('');
          } catch (err) {
            console.error('Return submit failed', err);
            alert('Failed to submit return request');
          } finally {
            setReturnSubmitting(false);
          }
        }} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Transaction number</label>
            <input value={returnTx} onChange={(e) => setReturnTx(e.target.value)} className="input w-full mt-1" placeholder="Transaction / UTR number" />
          </div>
          <div>
            <label className="text-sm font-medium">Product</label>
            <select value={returnProductId} onChange={(e) => setReturnProductId(e.target.value)} className="input w-full mt-1">
              <option value="">Select product</option>
              {items.map((it) => (
                <option key={it.id} value={it.Product?.id || it.id}>{it.Product?.name || it.Product}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Date received</label>
            <input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} className="input w-full mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Reason for return</label>
            <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="input w-full mt-1" rows={3} placeholder="Describe the issue or reason for return" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={returnSubmitting}>{returnSubmitting ? 'Submitting...' : 'Submit return request'}</button>
            <button type="button" className="btn-ghost" onClick={() => { setReturnTx(''); setReturnProductId(''); setReceivedDate(''); setReturnReason(''); }}>Reset</button>
          </div>
        </form>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">Total: ₹{Number(order.total_amount).toFixed(2)}</p>
        {order.payment_status !== 'paid' && (
          <button onClick={handlePay} disabled={paying} className="btn-primary">
            {paying ? 'Processing...' : 'Simulate Payment'}
          </button>
        )}
      </div>
    </div>
  );
}

// fallback generator for orders
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
