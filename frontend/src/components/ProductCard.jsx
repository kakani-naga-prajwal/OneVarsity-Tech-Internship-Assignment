import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, index = 0 }) {
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const price = Number(product.price || 0);
  const stock = Number(product.stock || 0);
  const stagger = Math.min(index, 7);
  const primaryTag =
    (product.Category?.name || product.name || 'product').split(' ')[0];
  
  // Multiple fallback image sources - high quality product images
  const fallbackImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop', // headphones
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop', // sneakers
    'https://images.unsplash.com/photo-1508317870467-d17e14e575af?w=600&h=450&fit=crop', // watch
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=450&fit=crop', // fashion
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop', // makeup
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=450&fit=crop', // cosmetics
  ];
  
  const displayImage = product.image_url || fallbackImages[index % fallbackImages.length];

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (stock < 1) return;
    setAdding(true);
    setSuccess(false);
    try {
      const result = await addToCart(product, 1);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 600);
        // After adding, go directly to cart for payment
        navigate('/cart');
        return;
      }
    } catch (err) {
      console.warn('Context add to cart failed, trying fallback', err);
    }

    // Fallback: save to demoCart when backend fails
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 600);
      navigate('/cart');
    } catch (fallbackErr) {
      console.error('Demo cart fallback failed', fallbackErr);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="card-hover group block opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${stagger * 50}ms` }}
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-stone-100 to-stone-200 overflow-hidden flex items-center justify-center">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-3 border-stone-300 border-t-primary-500 rounded-full animate-spin" />
          </div>
        )}
        <img
          src={displayImage}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.warn('Image failed to load:', displayImage);
            e.target.style.display = 'none';
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
        />
        {product.Category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-white/90 text-stone-600 text-xs font-medium shadow-sm z-20">
            {product.Category.name}
          </span>
        )}
        {stock < 5 && stock > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-medium z-20">
            Only {stock} left
          </span>
        )}
        {stock === 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium z-20">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="font-semibold text-stone-800 truncate group-hover:text-primary-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-primary-600 mt-1">
          ₹{price.toFixed(2)}
        </p>
        <button
          onClick={handleAddToCart}
          disabled={stock < 1 || adding}
          className={`mt-3 w-full py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            success
              ? 'bg-primary-500 text-white animate-success-pulse'
              : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98]'
          } ${adding ? 'opacity-80' : ''}`}
        >
          {adding ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : success ? (
            'Added to cart'
          ) : stock < 1 ? (
            'Out of stock'
          ) : (
            'Add to cart'
          )}
        </button>
      </div>
    </Link>
  );
}
