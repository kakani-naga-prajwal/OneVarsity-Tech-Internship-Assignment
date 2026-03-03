import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../api/axios';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  // default to alphabetical listing
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cat = searchParams.get('category') || '';
    setCategory(cat);
  }, [searchParams]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };

      // If category is a valid UUID, pass it. If it's a slug, maybe backend handles or ignores.
      // Usually category filtering is expected to be ID, but backend can adapt.
      if (category && category !== 'All') {
        params.category = category;
      }

      if (search) params.search = search;
      if (sort) params.sort_by = sort;
      if (order) params.sort_order = order;

      const res = await api.get('/products', { params });

      let fetchedProducts = res.data?.data || [];
      // manual filtering if category was passed as a name string instead of UUID (for robustness)
      if (category && typeof category === 'string' && category.length < 32) {
        fetchedProducts = fetchedProducts.filter(
          p => (p.Category?.name || '').toLowerCase() === category.toLowerCase()
        );
      }

      // always apply requested sort on client side too, in case server response was cached
      if (sort === 'name') {
        fetchedProducts.sort((a, b) =>
          order === 'ASC' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
      } else if (sort === 'price') {
        fetchedProducts.sort((a, b) =>
          order === 'ASC' ? a.price - b.price : b.price - a.price
        );
      }

      setProducts(fetchedProducts);
      setPagination(res.data?.pagination || { page: 1, totalPages: 1, total: fetchedProducts.length });
    } catch (err) {
      // Fallback to demo/offline products when backend is unavailable
      console.warn('Backend products unavailable, using fallback products', err);
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

      // Apply sorting
      if (sort === 'name') {
        fallbackProds.sort((a, b) => (order === 'ASC' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
      } else if (sort === 'price') {
        fallbackProds.sort((a, b) => (order === 'ASC' ? a.price - b.price : b.price - a.price));
      }

      setProducts(fallbackProds);
      setPagination({ page: 1, totalPages: 1, total: fallbackProds.length });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => data.success && setCategories(data.data || []))
      .catch(() => {
        // Fallback: extract unique categories from fallback products
        const uniqueCats = new Map();
        FALLBACK_PRODUCTS.forEach(p => {
          if (p.Category?.name && !uniqueCats.has(p.Category.name)) {
            uniqueCats.set(p.Category.name, { id: p.Category.name, name: p.Category.name });
          }
        });
        setCategories(Array.from(uniqueCats.values()));
      });
  }, []);

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort, order]);

  const handlePage = (p) => () => load(p);

  return (
    <div>
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Shop</h1>
      <p className="text-stone-600 mb-8">Browse by category or search for products.</p>

      {/* Categories */}
      <div className="mb-8">
        <p className="text-sm font-medium text-stone-500 mb-3">Categories</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setCategory(''); setSearchParams({}); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${!category
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-white/80 text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCategory(c.id); setSearchParams({ category: c.id }); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${category === c.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white/80 text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-xs flex-1 min-w-[200px]"
        />
        <select
          value={`${sort}-${order}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split('-');
            setSort(s);
            setOrder(o);
          }}
          className="input max-w-[200px]"
        >
          <option value="name-ASC">Name A–Z</option>
          <option value="created_at-DESC">Newest first</option>
          <option value="name-DESC">Name Z–A</option>
          <option value="price-ASC">Price: low to high</option>
          <option value="price-DESC">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          {products.length === 0 && (
            <p className="text-center text-stone-500 py-12">No products found. Try a different search or category.</p>
          )}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={handlePage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-secondary"
              >
                Previous
              </button>
              <span className="py-2 px-4 text-stone-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={handlePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
