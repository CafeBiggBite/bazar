const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

// Register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone, address, city, zip_code } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result = db.prepare(`
      INSERT INTO users (name, email, password, phone, address, city, zip_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, hashedPassword, phone || null, address || null, city || null, zip_code || null);

    const token = jwt.sign(
      { id: result.lastInsertRowid, email, name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: result.lastInsertRowid, name, email, phone, city }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        isAdmin: !!user.is_admin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', require('../middleware/auth'), (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, email, phone, address, city, zip_code, is_admin, created_at FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', require('../middleware/auth'), (req, res) => {
  try {
    const { name, phone, address, city, zip_code } = req.body;
    
    db.prepare(`
      UPDATE users 
      SET name = COALESCE(?, name), 
          phone = COALESCE(?, phone), 
          address = COALESCE(?, address), 
          city = COALESCE(?, city), 
          zip_code = COALESCE(?, zip_code)
      WHERE id = ?
    `).run(name, phone, address, city, zip_code, req.user.id);

    const updatedUser = db.prepare('SELECT id, name, email, phone, address, city, zip_code FROM users WHERE id = ?').get(req.user.id);
    
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
