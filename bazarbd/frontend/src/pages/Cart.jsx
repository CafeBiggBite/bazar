import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, total, loading, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="card text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your cart</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="card text-center py-16">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <Link to="/products" className="btn-primary inline-flex items-center">
              Continue Shopping <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => {
                const price = item.discount_price || item.price;
                const image = item.images ? JSON.parse(item.images)?.[0] : null;
                
                return (
                  <div key={item.id} className="card p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0">
                        <img
                          src={image || '/placeholder.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(item.name);
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <Link to={`/product/${item.product_id}`} className="font-medium hover:text-primary-600">
                          {item.name}
                        </Link>
                        <p className="text-primary-600 font-bold mt-1">
                          ৳{price.toLocaleString('en-BD')}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>৳{total.toLocaleString('en-BD')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{total >= 500 ? 'Free' : '৳60'}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary-600">
                        ৳{(total >= 500 ? total : total + 60).toLocaleString('en-BD')}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full btn-primary py-3"
                >
                  Proceed to Checkout
                </button>

                <Link to="/products" className="block text-center mt-4 text-primary-600 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
