import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';
import './ProductGrid.css';

export default function ProductGrid({ category = null, search = null, limit = null }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart ? useCart() : { addToCart: () => { } };
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState({});

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      // In this setup the backend expects category as UUID, if frontend passes a name we omit it
      // if (category) params.category = category; // assuming we'd pass UUID if enabled
      if (search) params.search = search;
      if (limit) params.limit = limit;

      const res = await api.get('/products', { params });

      let items = res.data.data || [];
      // Hack: if category was a name string, filter it manually here
      if (category && typeof category === 'string' && category.length < 32) {
        items = items.filter(
          p => (p.Category?.name || '').toLowerCase() === category.toLowerCase()
        );
      }
      setProducts(items);
      if (items.length === 0) setError('No products found');
    } catch (err) {
      console.warn('Backend products unavailable, using fallback', err);
      // Fallback to demo/offline products when backend is unavailable
      let fallbackProds = [...FALLBACK_PRODUCTS];

      // Apply filters to fallback products
      if (search) {
        fallbackProds = fallbackProds.filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
        );
      }

      if (category && category !== 'All') {
        fallbackProds = fallbackProds.filter(p =>
          p.Category?.name === category || p.Category?.id === category
        );
      }

      if (limit) {
        fallbackProds = fallbackProds.slice(0, limit);
      }

      setProducts(fallbackProds);
      if (fallbackProds.length === 0) setError('No products found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      if (addToCart && typeof addToCart === 'function') {
        const result = await addToCart(product, 1);
        if (result.success) {
          setAddedToCart(prev => ({ ...prev, [product.id]: true }));
          setTimeout(() => setAddedToCart(prev => ({ ...prev, [product.id]: false })), 1800);
          // Navigate to cart after successful add
          navigate('/cart');
          return;
        }
      }
    } catch (e) {
      console.warn('Context add to cart failed', e);
    }

    // Fallback: save to demoCart in localStorage so payment flow can continue offline
    try {
      const demoCartRaw = localStorage.getItem('demoCart');
      const demoCart = demoCartRaw ? JSON.parse(demoCartRaw) : [];
      const existing = demoCart.find((it) => it.id === product.id);
      if (existing) {
        existing.quantity = (existing.quantity || 0) + 1;
      } else {
        demoCart.push({ id: product.id, Product: product, quantity: 1 });
      }
      localStorage.setItem('demoCart', JSON.stringify(demoCart));
      setAddedToCart(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => setAddedToCart(prev => ({ ...prev, [product.id]: false })), 1800);
      // Navigate to cart
      navigate('/cart');
    } catch (ee) {
      console.error('Demo cart fallback failed', ee);
    }
  };

  if (loading) return (
    <div className="product-grid-container">
      <div className="loading-spinner">
        <div className="spinner" />
        <p>Loading products...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="product-grid-container">
      <div className="error-message">
        <p className="error-icon">⚠️</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="product-grid-container">
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <Link to={`/products/${product.id}`} className="product-image-link">
              <div className="product-image">
                <img src={product.image_url} alt={product.name} loading="lazy" onError={(e) => { e.target.src = 'https://picsum.photos/400/400?random=999'; }} />
                <div className={`stock-badge ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-stock'}`}>
                  {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                </div>
              </div>
            </Link>

            <div className="product-info">
              <Link to={`/products/${product.id}`} className="product-name-link">
                <h3 className="product-name">{product.name}</h3>
              </Link>

              <p className="product-description">{(product.description || '').substring(0, 60)}{(product.description || '').length > 60 ? '...' : ''}</p>

              <div className="product-footer">
                <div className="price-section">
                  <span className="price">₹{Number(product.price).toLocaleString()}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`add-to-cart-btn ${addedToCart[product.id] ? 'added' : ''}`}
                  disabled={product.stock === 0}
                >
                  {addedToCart[product.id] ? '✓ Added' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
