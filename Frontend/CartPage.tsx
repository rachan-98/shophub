import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, total, updateItem, removeItem, isLoading } = useCartStore();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await updateItem(itemId, newQty);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link to="/products" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-3 rounded-lg inline-block transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.product?.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.product?.name}</p>
                <p className="text-amber-600 font-bold mt-1">₹{Number(item.product?.price).toLocaleString('en-IN')}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isLoading}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-amber-400 disabled:opacity-40 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={isLoading}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-amber-400 disabled:opacity-40 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-lg transition-colors"
            >
              Proceed to Checkout
            </button>

            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-4 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
