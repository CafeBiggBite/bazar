import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<div className="container-custom py-20 text-center">Product Detail Page - Coming Soon</div>} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<div className="container-custom py-20 text-center">Checkout Page - Coming Soon</div>} />
              <Route path="/orders" element={<div className="container-custom py-20 text-center">My Orders Page - Coming Soon</div>} />
              <Route path="/profile" element={<div className="container-custom py-20 text-center">Profile Page - Coming Soon</div>} />
              <Route path="/wishlist" element={<div className="container-custom py-20 text-center">Wishlist Page - Coming Soon</div>} />
              <Route path="/admin" element={<div className="container-custom py-20 text-center">Admin Dashboard - Coming Soon</div>} />
              <Route path="/deals" element={<div className="container-custom py-20 text-center">Deals Page - Coming Soon</div>} />
              <Route path="/help" element={<div className="container-custom py-20 text-center">Help Center - Coming Soon</div>} />
            </Routes>
            
            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12 mt-20">
              <div className="container-custom">
                <div className="grid md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">BazarBD</h3>
                    <p className="text-gray-400 text-sm">
                      Bangladesh's premier e-commerce platform offering quality products at competitive prices.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/products" className="hover:text-white">All Products</a></li>
                      <li><a href="/deals" className="hover:text-white">Deals</a></li>
                      <li><a href="/about" className="hover:text-white">About Us</a></li>
                      <li><a href="/contact" className="hover:text-white">Contact</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Customer Service</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/help" className="hover:text-white">Help Center</a></li>
                      <li><a href="/returns" className="hover:text-white">Returns</a></li>
                      <li><a href="/shipping" className="hover:text-white">Shipping Info</a></li>
                      <li><a href="/faq" className="hover:text-white">FAQ</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Contact Info</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>📞 09612-345678</li>
                      <li>✉️ support@bazarbd.com</li>
                      <li>📍 Dhaka, Bangladesh</li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                  <p>&copy; 2024 BazarBD. All rights reserved. Made with ❤️ in Bangladesh</p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
