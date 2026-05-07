const express = require('express');
const db = require('../database');
const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category
router.get('/:id', (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category (admin only)
router.post('/', (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const result = db.prepare(`
      INSERT INTO categories (name, description, image)
      VALUES (?, ?, ?)
    `).run(name, description || null, image || null);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category (admin only)
router.put('/:id', (req, res) => {
  try {
    const { name, description, image } = req.body;

    db.prepare(`
      UPDATE categories 
      SET name = COALESCE(?, name), 
          description = COALESCE(?, description), 
          image = COALESCE(?, image)
      WHERE id = ?
    `).run(name, description, image, req.params.id);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    
    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category (admin only)
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
