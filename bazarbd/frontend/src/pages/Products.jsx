import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: 'newest',
    minPrice: '',
    maxPrice: ''
  });
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API_URL}/products?${params}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
            <p className="text-gray-600 mt-1">
              {pagination.totalItems || 0} products found
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-secondary flex items-center space-x-2"
          >
            <SlidersHorizontal size={20} />
            <span>Filters</span>
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`md:col-span-1 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="card sticky top-24">
              <h2 className="font-semibold text-lg mb-4 flex items-center">
                <SlidersHorizontal size={20} className="mr-2" />
                Filters
              </h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search products..."
                    className="input-field pl-10"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    className="input-field text-sm"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({
                  category: '',
                  search: '',
                  sort: 'newest',
                  minPrice: '',
                  maxPrice: ''
                })}
                className="w-full btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="card text-center py-20">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 space-x-2">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: pagination.currentPage - 1 }))}
                      disabled={pagination.currentPage === 1}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                        className={`px-4 py-2 rounded-lg ${
                          pagination.currentPage === i + 1
                            ? 'bg-primary-600 text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, page: pagination.currentPage + 1 }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
