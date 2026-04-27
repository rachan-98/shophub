import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';

interface Product {
  id: string; name: string; price: number; image_url: string | null;
  rating: number; review_count: number; stock: number; brand: string | null;
  category_name?: string;
}
interface ProductsResponse { data: Product[]; total: number; page: number; totalPages: number; }
interface Category { id: string; name: string; slug: string; }

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['products', { search, category, sortBy, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), sortBy, limit: '12' });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      const { data } = await api.get(`/products?${params}`);
      return data;
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">
            Search
          </button>
        </form>

        <div className="flex gap-3">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          >
            <option value="created_at">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-5 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{data?.total ?? 0} products found</p>
          {data?.data.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <SlidersHorizontal size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {data?.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: data!.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-amber-500 text-black'
                      : 'bg-white border border-gray-300 hover:border-amber-400 text-gray-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
