import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Heart, Package } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        {/* Top Bar */}
        <div className="hidden md:flex justify-between items-center py-2 border-b">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>📍 Bangladesh's #1 E-commerce Platform</span>
            <span>|</span>
            <span>📞 09612-345678</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <Link to="/orders" className="hover:text-primary-600">Track Order</Link>
            <span>|</span>
            <Link to="/help" className="hover:text-primary-600">Help</Link>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 py-1 rounded-lg font-bold text-xl">
              BazarBD
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands and more..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pr-10"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 hover:text-primary-600">
                  <User size={24} />
                  <span className="hidden lg:block">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                    {user.isAdmin && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100 text-primary-600">Admin Panel</Link>
                    )}
                    <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 hover:text-primary-600">
                <User size={24} />
                <span className="hidden lg:block">Login</span>
              </Link>
            )}

            <Link to="/wishlist" className="hidden md:flex items-center space-x-2 hover:text-primary-600">
              <Heart size={24} />
              <span className="hidden lg:block">Wishlist</span>
            </Link>

            <Link to="/cart" className="relative flex items-center space-x-2 hover:text-primary-600">
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
              <span className="hidden lg:block">Cart</span>
            </Link>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="hidden md:flex items-center space-x-6 py-3 border-t overflow-x-auto">
          <Link to="/products" className="whitespace-nowrap hover:text-primary-600 font-medium">All Products</Link>
          <Link to="/products?category=1" className="whitespace-nowrap hover:text-primary-600">Electronics</Link>
          <Link to="/products?category=2" className="whitespace-nowrap hover:text-primary-600">Fashion</Link>
          <Link to="/products?category=3" className="whitespace-nowrap hover:text-primary-600">Home & Living</Link>
          <Link to="/products?category=4" className="whitespace-nowrap hover:text-primary-600">Beauty & Health</Link>
          <Link to="/products?category=5" className="whitespace-nowrap hover:text-primary-600">Sports</Link>
          <Link to="/products?category=6" className="whitespace-nowrap hover:text-primary-600">Books</Link>
          <Link to="/deals" className="whitespace-nowrap text-red-600 font-semibold">🔥 Deals</Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="p-4">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </form>
            <div className="space-y-3">
              <Link to="/products" className="block hover:text-primary-600">All Products</Link>
              <Link to="/products?category=1" className="block hover:text-primary-600">Electronics</Link>
              <Link to="/products?category=2" className="block hover:text-primary-600">Fashion</Link>
              <Link to="/products?category=3" className="block hover:text-primary-600">Home & Living</Link>
              <Link to="/cart" className="block hover:text-primary-600">Cart ({itemCount})</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block hover:text-primary-600">Profile</Link>
                  <Link to="/orders" className="block hover:text-primary-600">My Orders</Link>
                  <button onClick={logout} className="block text-left text-red-600">Logout</button>
                </>
              ) : (
                <Link to="/login" className="block hover:text-primary-600">Login</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
