import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { QRCodeCanvas } from 'qrcode.react';

export default function Cart() {
  const { cart, loading, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-700">Your cart is empty</h2>
        <Link to="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Cart</h1>
      <div className="space-y-4">
        {cart.map((item) => {
          const p = item.Product;
          const price = Number(p?.price || 0);
          const sub = price * (item.quantity || 0);
          return (
            <div key={item.id} className="card p-4 flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                {p?.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${p?.id}`} className="font-medium text-slate-800 hover:underline truncate block">
                  {p?.name}
                </Link>
                <p className="text-slate-600">₹{price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                  }}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm font-semibold"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={p?.stock || 99}
                  value={item.quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 1) updateQuantity(item.id, v);
                  }}
                  className="input w-16 text-center"
                />
                <button
                  onClick={() => {
                    if (item.quantity < (p?.stock || 99)) updateQuantity(item.id, item.quantity + 1);
                  }}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm font-semibold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 hover:text-red-700 text-sm ml-2"
                  aria-label="Remove"
                >
                  Remove
                </button>
              </div>
              <div className="font-medium">₹{sub.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 card p-6">
        <span className="text-lg font-semibold">Total: ₹{cartTotal.toFixed(2)}</span>
      </div>

      {/* payment options section */}
      <div className="mt-6 card p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        <PaymentForm total={cartTotal} />
      </div>
    </div>
  );
}

function PaymentForm({ total }) {
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upi, setUpi] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const navigate = useNavigate();
  const { cart, removeFromCart, fetchCart } = useCart();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate inputs (basic)
    if (method === 'card' && (!card.number || !card.expiry || !card.cvv || !card.name)) return alert('Please fill card details.');
    if (method === 'upi' && (!upi || upi.length < 6)) return alert('Enter a valid UPI reference (at least 6 chars).');

    setSubmitting(true);
    try {
      // Offline/demo: create a local order from demoCart or cart
      const demoCartRaw = localStorage.getItem('demoCart');
      const currentCart = demoCartRaw ? JSON.parse(demoCartRaw) : cart;

      const orderItems = (currentCart || []).map((it, idx) => ({
        id: idx + 1,
        Product: it.Product || it,
        quantity: it.quantity || 1,
        price: Number((it.Product?.price || it.price || 0)),
      }));

      const newOrder = {
        id: `order-${Date.now()}`,
        order_number: `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        total_amount: total,
        payment_method: method,
        status: method === 'cod' ? 'pending' : 'confirmed',
        payment_status: method === 'cod' ? 'unpaid' : 'paid',
        OrderItems: orderItems,
        created_at: new Date().toISOString(),
      };

      // save to localStorage userOrders
      const stored = localStorage.getItem('userOrders');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newOrder);
      localStorage.setItem('userOrders', JSON.stringify(list));

      // clear demo cart
      localStorage.removeItem('demoCart');
      // attempt to refresh any remote cart (best-effort)
      try { await fetchCart(); } catch (_) {}

      // show success modal and auto-navigate after a short delay
      setOrderSuccess(newOrder);
      setTimeout(() => navigate(`/orders/${newOrder.id}`, { state: { order: newOrder, success: true } }), 1400);
      return;
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Failed to place order (demo mode)');
    } finally {
      setSubmitting(false);
    }
  };

  // OTP removed in demo/offline mode — payments complete immediately

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment"
            value="card"
            checked={method === 'card'}
            onChange={() => setMethod('card')}
          />
          Credit / Debit Card
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={method === 'cod'}
            onChange={() => setMethod('cod')}
          />
          Cash on Delivery
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="payment"
            value="upi"
            checked={method === 'upi'}
            onChange={() => setMethod('upi')}
          />
          UPI / Mobile Pay
        </label>
      </div>
      {method === 'card' && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Card number (16 digits)"
            value={card.number}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 16);
              setCard({ ...card, number: val });
            }}
            maxLength="16"
            className="input"
            required
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                setCard({ ...card, expiry: val });
              }}
              maxLength="5"
              className="input flex-1"
              required
            />
            <input
              type="text"
              placeholder="CVV"
              value={card.cvv}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setCard({ ...card, cvv: val });
              }}
              maxLength="4"
              className="input w-24"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Name on card"
            value={card.name}
            onChange={(e) => setCard({ ...card, name: e.target.value })}
            className="input"
            required
          />
        </div>
      )}
      {method === 'upi' && (
        <div className="space-y-4">
          <div className="border border-slate-200 rounded p-4 text-center">
            <p className="text-sm font-semibold mb-4 text-purple-700 mt-2">Scan with PhonePe</p>
            <div className="flex justify-center mb-4 bg-white p-2 inline-block rounded-xl shadow-sm border border-slate-100">
              <QRCodeCanvas
                value={`upi://pay?pa=admin@ybl&pn=KAKANI%20NAGA%20PRAJWAL&am=${total.toFixed(2)}&cu=INR`}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/PhonePe_Logo.svg/1024px-PhonePe_Logo.svg.png",
                  x: undefined,
                  y: undefined,
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-xs font-medium text-slate-500 mb-2">KAKANI NAGA PRAJWAL</p>
          </div>
          <input
            type="text"
            placeholder="Enter 12-digit UTR No. (after paying)"
            value={upi}
            onChange={(e) => setUpi(e.target.value)}
            className="input"
            required
            maxLength={12}
          />
        </div>
      )}
      {method === 'cod' ? (
        <div>
          <p className="text-sm text-slate-600 mb-2">You will pay on delivery.</p>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting}
          >
            {submitting ? 'Placing order...' : 'Place order (Pay later)'}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={submitting}
        >
          {submitting ? 'Processing...' : 'Pay ₹' + total.toFixed(2)}
        </button>
      )}

      {orderSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-center shadow-lg">
            <div className="text-4xl text-green-600">✓</div>
            <h3 className="text-xl font-semibold mt-2">Order Successful</h3>
            <p className="text-slate-600 mt-2">Your order <strong>{orderSuccess.order_number}</strong> has been placed.</p>
            <div className="mt-4 flex gap-3 justify-center">
              <button
                className="btn-primary"
                onClick={() => navigate(`/orders/${orderSuccess.id}`)}
              >
                View Order
              </button>
              <button
                className="btn-ghost"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3">You will be redirected shortly...</p>
          </div>
        </div>
      )}

    </form>
  );
}
