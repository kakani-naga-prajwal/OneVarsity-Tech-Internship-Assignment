import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, cartTotal, fetchCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!cart.length) return;
    setError('');
    setSubmitting(true);
    try {
      // Redirect to cart payment flow which performs OTP verification for all methods (including COD)
      navigate('/cart');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Your cart is empty.</p>
        <button onClick={() => navigate('/products')} className="btn-primary mt-4">Browse Products</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      <div className="card p-6 max-w-lg">
        <p className="text-slate-600 mb-4">
          You are placing an order for <strong>{cart.length}</strong> item(s). Total: <strong>₹{cartTotal.toFixed(2)}</strong>.
        </p>
        <p className="text-slate-500 text-sm mb-6">
          After placing the order, you can simulate payment on the order detail page.
        </p>
        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? 'Placing order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
