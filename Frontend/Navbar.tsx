import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Package, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useEffect } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-amber-400">
            <Package size={24} />
            ShopHub
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
              Shop
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/orders" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-colors text-sm flex items-center gap-1">
                    <LayoutDashboard size={16} />
                    Admin
                  </Link>
                )}
                <span className="text-gray-400 text-sm hidden sm:block">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors"
                  title="Log out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                <User size={20} />
              </Link>
            )}

            <Link to="/cart" className="relative text-gray-300 hover:text-white transition-colors">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
