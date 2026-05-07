import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Hero, Features } from '../components/Hero';
import { ShoppingBag, Clock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/featured`);
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }
    await addToCart(productId);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Features */}
      <Features />

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="card text-center hover:shadow-xl transition-shadow group"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                  <ShoppingBag size={28} className="text-primary-600 group-hover:text-white" />
                </div>
                <h3 className="font-medium text-gray-800">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-gray-100">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary-600 hover:underline font-medium">
              View All →
            </Link>
          </div>
          
          {featuredProducts.length === 0 ? (
            <div className="card text-center py-12">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No featured products yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose BazarBD?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Star size={36} />
              </div>
              <h3 className="font-semibold text-xl mb-2">Quality Products</h3>
              <p className="text-primary-200">Curated selection of genuine products</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Clock size={36} />
              </div>
              <h3 className="font-semibold text-xl mb-2">Fast Delivery</h3>
              <p className="text-primary-200">Same-day delivery in Dhaka</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <ShoppingBag size={36} />
              </div>
              <h3 className="font-semibold text-xl mb-2">Best Prices</h3>
              <p className="text-primary-200">Competitive pricing guaranteed</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <Star size={36} />
              </div>
              <h3 className="font-semibold text-xl mb-2">24/7 Support</h3>
              <p className="text-primary-200">Always here to help you</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-6">Get updates on new arrivals and special offers</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
