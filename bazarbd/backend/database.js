const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'bazarbd.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create Users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    zip_code TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Categories table
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Products table
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    discount_price REAL,
    stock INTEGER DEFAULT 0,
    category_id INTEGER,
    images TEXT,
    brand TEXT,
    sku TEXT UNIQUE,
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )
`);

// Create Orders table
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    order_number TEXT UNIQUE NOT NULL,
    total_amount REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    final_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'unpaid',
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_zip TEXT,
    shipping_phone TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Create Order Items table
db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// Create Reviews table
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// Create Cart table (for logged-in users)
db.exec(`
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

// Seed initial categories
const categories = [
  { name: 'Electronics', description: 'Mobile phones, laptops, gadgets', image: '/images/electronics.jpg' },
  { name: 'Fashion', description: 'Men, Women, Kids clothing', image: '/images/fashion.jpg' },
  { name: 'Home & Living', description: 'Furniture, decor, kitchen items', image: '/images/home.jpg' },
  { name: 'Beauty & Health', description: 'Cosmetics, skincare, supplements', image: '/images/beauty.jpg' },
  { name: 'Sports', description: 'Sports equipment, fitness gear', image: '/images/sports.jpg' },
  { name: 'Books', description: 'Educational, fiction, non-fiction', image: '/images/books.jpg' }
];

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, description, image) VALUES (?, ?, ?)
`);

categories.forEach(cat => {
  insertCategory.run(cat.name, cat.description, cat.image);
});

// Create admin user if not exists
const adminEmail = 'admin@bazarbd.com';
const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);

if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT INTO users (name, email, password, phone, city, is_admin) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run('Admin User', adminEmail, hashedPassword, '01700000000', 'Dhaka', 1);
  console.log('Admin user created: admin@bazarbd.com / admin123');
}

console.log('Database initialized successfully!');

module.exports = db;
