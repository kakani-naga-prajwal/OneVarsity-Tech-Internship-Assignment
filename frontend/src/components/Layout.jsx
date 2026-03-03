import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/95 backdrop-blur border-b border-stone-200/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
              Mega Mart
            </Link>
            <div className="flex items-center justify-between flex-1 ml-8">
              <nav className="flex items-center gap-1 sm:gap-3">
                <Link
                  to="/products"
                  className="px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Products
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/cart"
                      className="relative px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors flex items-center gap-1"
                    >
                      Cart
                      {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center font-medium animate-scale-in">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/orders"
                      className="px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors hidden sm:block"
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors font-medium"
                      >
                        Admin
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                    >
                      Login
                    </Link>
                    <Link to="/register" className="btn-primary text-sm">
                      Register
                    </Link>
                  </>
                )}
              </nav>

            {/* Profile Dropdown - Top Right */}
            {user && (
              <div className="relative ml-4">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-stone-700">{user.name.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-stone-200 z-50">
                    <div className="p-4 border-b border-stone-200">
                      <p className="font-semibold text-stone-900">{user.name}</p>
                      <p className="text-xs text-stone-500 mt-1">{user.role === 'admin' ? 'Admin' : 'Customer'}</p>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-stone-600">Email:</span>
                        <span className="text-stone-900 font-medium break-all">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex justify-between">
                          <span className="text-stone-600">Phone:</span>
                          <span className="text-stone-900 font-medium">{user.phone}</span>
                        </div>
                      )}
                      {user.nationality && (
                        <div className="flex justify-between">
                          <span className="text-stone-600">Nationality:</span>
                          <span className="text-stone-900 font-medium">{user.nationality}</span>
                        </div>
                      )}
                      {user.gender && (
                        <div className="flex justify-between">
                          <span className="text-stone-600">Gender:</span>
                          <span className="text-stone-900 font-medium">{user.gender}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 border-t border-stone-200 space-y-2">
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/products"
                          className="block px-3 py-2 rounded text-sm hover:bg-stone-100 text-stone-700 hover:text-primary-600 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          📦 Sell Products
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-gradient-to-b from-stone-100 to-stone-200/80 border-t border-stone-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-stone-600 text-sm">
            <div>
              <p className="font-semibold text-stone-800 mb-2">Mega Mart</p>
              <p>Quality products, fast delivery, easy returns.</p>
            </div>
            <div>
              <p className="font-semibold text-stone-800 mb-2">Quick links</p>
              <ul className="space-y-1">
                <li><Link to="/products" className="hover:text-primary-600 hover:underline">Products</Link></li>
                <li><Link to="/" className="hover:text-primary-600 hover:underline">Help Centre</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-stone-800 mb-2">Contact</p>
              <p>support@megamart.example.com</p>
              <p className="mt-1">Mon–Fri 9am–6pm</p>
            </div>
          </div>
          <p className="text-center text-stone-500 text-sm mt-8 pt-6 border-t border-stone-200">
            Mega Mart Order Processing &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
