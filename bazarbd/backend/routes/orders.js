const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');
const router = express.Router();

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BZ-${timestamp}-${random}`;
}

// Create order
router.post('/', auth, (req, res) => {
  try {
    const { shipping_address, shipping_city, shipping_zip, shipping_phone, payment_method, notes } = req.body;

    if (!shipping_address || !shipping_city || !shipping_phone || !payment_method) {
      return res.status(400).json({ message: 'Shipping details and payment method are required' });
    }

    // Get cart items
    const cartItems = db.prepare(`
      SELECT c.*, p.price, p.discount_price, p.stock 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ?
    `).all(req.user.id);

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    let totalAmount = 0;
    cartItems.forEach(item => {
      const price = item.discount_price || item.price;
      totalAmount += price * item.quantity;
    });

    const orderNumber = generateOrderNumber();

    // Create order
    const orderResult = db.prepare(`
      INSERT INTO orders (user_id, order_number, total_amount, final_amount, payment_method, shipping_address, shipping_city, shipping_zip, shipping_phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, orderNumber, totalAmount, totalAmount, payment_method, shipping_address, shipping_city, shipping_zip || null, shipping_phone, notes || null);

    // Create order items
    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `);

    cartItems.forEach(item => {
      const price = item.discount_price || item.price;
      const subtotal = price * item.quantity;
      insertOrderItem.run(orderResult.lastInsertRowid, item.product_id, item.quantity, price, subtotal);

      // Update product stock
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
    });

    // Clear cart
    db.prepare('DELETE FROM cart WHERE user_id = ?').run(req.user.id);

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: orderResult.lastInsertRowid,
        order_number: orderNumber,
        total_amount: totalAmount
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/my-orders', auth, (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.user.id);

    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.name, p.images 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);

      return { ...order, items };
    });

    res.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', auth, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user_id !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const items = db.prepare(`
      SELECT oi.*, p.name, p.images 
      FROM order_items oi 
      JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id = ?
    `).all(order.id);

    res.json({ order: { ...order, items } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.put('/:id/status', auth, (req, res) => {
  try {
    const { status, payment_status } = req.body;

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    params.push(req.params.id);
    db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);

    res.json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/', auth, (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const orders = db.prepare(query).all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    if (status) {
      countQuery += ' WHERE status = ?';
    }
    const { total } = db.prepare(countQuery).get(status ? status : undefined);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
