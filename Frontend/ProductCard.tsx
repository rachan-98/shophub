import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  rating: number;
  review_count: number;
  stock: number;
  brand?: string | null;
  category_name?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id);
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📦</div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.brand}</p>
          )}
          <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-600">{Number(product.rating).toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.review_count})</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">₹{Number(product.price).toLocaleString('en-IN')}</span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-black rounded-lg transition-colors"
              title="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
