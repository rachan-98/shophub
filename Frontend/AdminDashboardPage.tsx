import { useQuery } from '@tanstack/react-query';
import { Users, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import api from '../../services/api';

interface DashboardData {
  stats: { totalUsers: number; totalProducts: number; totalOrders: number; totalRevenue: number; };
  recentOrders: { id: string; user_name: string; status: string; total_amount: number; created_at: string; }[];
  topProducts: { name: string; units_sold: number; revenue: number; }[];
  ordersByStatus: { status: string; count: string; }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: data?.stats.totalUsers ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'Total Products', value: data?.stats.totalProducts ?? 0, icon: Package, color: 'text-purple-600' },
    { label: 'Total Orders', value: data?.stats.totalOrders ?? 0, icon: ShoppingBag, color: 'text-amber-600' },
    { label: 'Revenue', value: `₹${(data?.stats.totalRevenue ?? 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{s.label}</p>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {data?.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{order.user_name}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-3">
            {data?.topProducts.map((product, i) => (
              <div key={product.name} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.units_sold} units sold</p>
                </div>
                <span className="text-sm font-semibold text-green-600">₹{Number(product.revenue).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
