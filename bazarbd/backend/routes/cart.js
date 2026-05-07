const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');
const router = express.Router();

// Get cart items
router.get('/', auth, (req, res) => {
  try {
    const cartItems = db.prepare(`
      SELECT c.*, p.name, p.price, p.discount_price, p.images 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `).all(req.user.id);

    const total = cartItems.reduce((sum, item) => {
      const price = item.discount_price || item.price;
      return sum + (price * item.quantity);
    }, 0);

    res.json({ cartItems, total });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add to cart
router.post('/add', auth, (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in cart
    const existingItem = db.prepare('SELECT * FROM cart WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);

    if (existingItem) {
      db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(quantity, existingItem.id);
    } else {
      db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, product_id, quantity);
    }

    res.json({ message: 'Added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update/:id', auth, (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Remove from cart if quantity is 0 or less
      db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    } else {
      db.prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, req.params.id, req.user.id);
    }

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove from cart
router.delete('/remove/:id', auth, (req, res) => {
  try {
    db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', auth, (req, res) => {
  try {
    db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
