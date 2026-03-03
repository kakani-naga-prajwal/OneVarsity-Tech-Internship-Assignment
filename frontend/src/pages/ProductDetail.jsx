import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getFallbackProduct, getFallbackReviews } from '../data/fallbackProducts';
import api from '../api/axios';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
// Product KPI removed for customer view; showing description + reviews instead

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const isFallback = id?.startsWith('fb-');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error(err);
        setProduct(getFallbackProduct(id));
      } finally {
        setLoading(false);
      }
    };

    if (isFallback) {
      setProduct(getFallbackProduct(id));
      setLoading(false);
    } else {
      loadProduct();
    }
  }, [id, isFallback]);

  const handleAddToCart = async () => {
    if (isFallback) {
      // Add to a demo local cart so customer can proceed to payment in offline/demo mode
      try {
        const demoCartRaw = localStorage.getItem('demoCart');
        const demoCart = demoCartRaw ? JSON.parse(demoCartRaw) : [];
        const existing = demoCart.find((it) => it.id === product.id);
        if (existing) existing.quantity = (existing.quantity || 0) + quantity;
        else demoCart.push({ id: product.id, Product: product, quantity });
        localStorage.setItem('demoCart', JSON.stringify(demoCart));
        navigate('/cart');
        return;
      } catch (e) {
        setMessage('Demo cart failed.');
        return;
      }
    }
    if (!user) {
      navigate('/login');
      return;
    }
    setMessage('');
    try {
      await addToCart(product, quantity);
      setMessage('Added to cart');
      // Navigate to cart to proceed with payment
      navigate('/cart');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading || !product) {
    return (
      <div className="flex justify-center py-12">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
        ) : (
          <p className="text-stone-600">Product not found.</p>
        )}
      </div>
    );
  }

  const stock = Number(product.stock);
  const primaryTag =
    (product.Category?.name || product.name || 'product').split(' ')[0];
  const fallbackImage = `https://source.unsplash.com/800x800/?${encodeURIComponent(
    primaryTag
  )},shopping,store`;
  const displayImage = product.image_url || fallbackImage;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 aspect-square max-h-[400px] bg-stone-100 rounded-2xl overflow-hidden shadow-card">
          <img src={displayImage} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-stone-800">{product.name}</h1>
          {product.Category && (
            <p className="text-stone-500 mt-1">{product.Category.name}</p>
          )}
          <p className="text-2xl text-primary-600 font-bold mt-4">₹{Number(product.price).toFixed(2)}</p>
          {product.description && (
            <div className="mt-4">
              <p className="text-stone-600">{product.description}</p>
              <AboutProduct product={product} />
            </div>
          )}
          <p className="text-stone-600 mt-2">Stock: {stock}</p>

          {/* Payment details */}
          <div className="mt-6 card p-4 space-y-2">
            <p className="font-semibold text-stone-800">Price & payment details</p>
            <div className="flex justify-between text-sm text-stone-700">
              <span>Price per item</span>
              <span>₹{Number(product.price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-700">
              <span>Selected quantity</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-stone-900 border-t border-stone-200 pt-2 mt-1">
              <span>Estimated total</span>
              <span>₹{(quantity * Number(product.price)).toFixed(2)}</span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              You&apos;ll review and complete payment on the checkout page. This demo supports a simulated payment step.
            </p>
          </div>

          {message && (
            <p className={`mt-2 text-sm ${message.includes('Added') ? 'text-primary-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <div className="flex items-center gap-4 mt-6">
            <input
              type="number"
              min={1}
              max={stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(stock, parseInt(e.target.value, 10) || 1)))}
              className="input w-20"
            />
            <button
              onClick={handleAddToCart}
              disabled={stock < 1}
              className="btn-primary"
            >
              Add to Cart
            </button>
          </div>
        </div>

      </div>

      {/* Product description and user feedback (customer view) */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Product description</h2>
        {product.description ? (
          <p className="text-stone-600 mb-4">{product.description}</p>
        ) : (
          <p className="text-stone-500 italic mb-4">No description available.</p>
        )}

        <h2 className="text-xl font-semibold mb-3">User feedback</h2>
        <ReviewsList productId={product.id} />
      </div>
    </div>
  );
}

function AboutProduct({ product }) {
  const bullets = [];
  if (product.description?.toLowerCase().includes('leather')) bullets.push('Material: Genuine leather');
  if (product.description?.toLowerCase().includes('mesh')) bullets.push('Material: Breathable mesh fabric');
  if (product.Category?.name) bullets.push(`Category: ${product.Category.name}`);
  bullets.push(`Price: ₹${Number(product.price).toFixed(2)}`);
  bullets.push(product.stock > 0 ? `Availability: In stock (${product.stock})` : 'Availability: Out of stock');
  bullets.push('Shipping: Usually dispatched within 1 business day (demo)');
  bullets.push('Warranty: 6 months manufacturer/demo warranty');

  return (
    <div className="mt-3 p-3 bg-slate-50 rounded">
      <h3 className="font-semibold mb-2">About this product</h3>
      <p className="text-sm text-stone-600 mb-2">A short explanation to help you understand what this product offers and why it may fit your needs.</p>
      <ul className="list-disc list-inside text-sm text-stone-700 space-y-1">
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

function ReviewsList({ productId }) {
  const reviews = getFallbackReviews(productId);
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) || 0;

  // prepare distribution for bar chart
  const dist = [1, 2, 3, 4, 5].map((n) => ({ rating: n, count: reviews.filter(r => r.rating === n).length }));

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500">Average rating</p>
          <p className="text-2xl font-bold">{avg.toFixed(1)} / 5</p>
        </div>
        <div className="text-sm text-slate-600">{reviews.length} reviews</div>
      </div>

      {/* rating distribution chart */}
      <div className="h-36 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dist} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" stroke="#64748b" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        {(reviews.slice(0, 6)).map((r) => (
          <div key={r.id} className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-slate-800">{r.user.name}</div>
              <div className="text-sm text-amber-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            </div>
            <div className="text-sm text-slate-600 mt-1">{new Date(r.created_at).toLocaleDateString()}</div>
            <p className="mt-2 text-slate-700">{r.comment}</p>
          </div>
        ))}
        {reviews.length > 6 && (
          <details className="pt-2">
            <summary className="cursor-pointer text-sm text-primary-600">Show all {reviews.length} reviews</summary>
            <div className="mt-2 space-y-4">
              {reviews.slice(6).map((r) => (
                <div key={r.id} className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-800">{r.user.name}</div>
                    <div className="text-sm text-amber-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">{new Date(r.created_at).toLocaleDateString()}</div>
                  <p className="mt-2 text-slate-700">{r.comment}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
