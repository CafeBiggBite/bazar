const express = require('express');
const db = require('../database');
const router = express.Router();

// Get all products with filtering, sorting, and pagination
router.get('/', (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12, minPrice, maxPrice } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = 1
    `;
    
    const params = [];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC';
        break;
      case 'popular':
        query += ' ORDER BY p.stock DESC';
        break;
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    // Get total count
    const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*) as total');
    const countQueryWithoutOrder = countQuery.split(' ORDER BY')[0];
    const { total } = db.prepare(countQueryWithoutOrder).get(...params);

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const products = db.prepare(query).all(...params);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured products
router.get('/featured', (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_featured = 1 AND p.is_active = 1 
      ORDER BY p.created_at DESC 
      LIMIT 8
    `).all();

    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `).get(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get reviews
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.product_id = ? 
      ORDER BY r.created_at DESC
    `).all(req.params.id);

    // Calculate average rating
    const avgRating = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE product_id = ?').get(req.params.id);

    res.json({ product, reviews, averageRating: avgRating.avg || 0 });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product (admin only)
router.post('/', (req, res) => {
  try {
    const { name, description, price, discount_price, stock, category_id, images, brand, sku, is_featured } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }

    const result = db.prepare(`
      INSERT INTO products (name, description, price, discount_price, stock, category_id, images, brand, sku, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, description || null, price, discount_price || null, stock || 0, category_id || null, images ? JSON.stringify(images) : null, brand || null, sku || null, is_featured ? 1 : 0);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin only)
router.put('/:id', (req, res) => {
  try {
    const { name, description, price, discount_price, stock, category_id, images, brand, sku, is_featured, is_active } = req.body;

    db.prepare(`
      UPDATE products 
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          price = COALESCE(?, price),
          discount_price = COALESCE(?, discount_price),
          stock = COALESCE(?, stock),
          category_id = COALESCE(?, category_id),
          images = COALESCE(?, images),
          brand = COALESCE(?, brand),
          sku = COALESCE(?, sku),
          is_featured = COALESCE(?, is_featured),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name, description, price, discount_price, stock, category_id, images ? JSON.stringify(images) : null, brand, sku, is_featured ? 1 : 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, req.params.id);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review
router.post('/:id/reviews', (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const result = db.prepare(`
      INSERT INTO reviews (user_id, product_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `).run(req.body.user_id || 1, req.params.id, rating, comment || null);

    res.status(201).json({ message: 'Review added successfully', reviewId: result.lastInsertRowid });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
