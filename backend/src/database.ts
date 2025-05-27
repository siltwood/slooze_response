import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
console.log(`📂 Database location: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: 'Manager' | 'Store Keeper';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive';
  lowStockThreshold: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Initialize database tables
export const initializeDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('Manager', 'Store Keeper')),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          sku TEXT UNIQUE NOT NULL,
          price REAL NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          category TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          lowStockThreshold INTEGER NOT NULL DEFAULT 10,
          description TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create sessions table for better session management
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          userId INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          expiresAt DATETIME NOT NULL,
          FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      resolve();
    });
  });
};

// Seed initial data
export const seedDatabase = async (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if users already exist
      db.get('SELECT COUNT(*) as count FROM users', async (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          // Hash passwords
          const managerPassword = await bcrypt.hash('manager123', 10);
          const keeperPassword = await bcrypt.hash('keeper123', 10);

          // Insert demo users
          db.run(`
            INSERT INTO users (email, password, name, role)
            VALUES 
              ('manager@slooze.xyz', ?, 'John Manager', 'Manager'),
              ('keeper@slooze.xyz', ?, 'Jane Keeper', 'Store Keeper')
          `, [managerPassword, keeperPassword]);

          // Insert demo products
          db.run(`
            INSERT INTO products (name, sku, price, stock, category, lowStockThreshold, description, status)
            VALUES 
              ('Coffee Beans', 'COF-001', 25.99, 150, 'Beverages', 20, 'Premium Colombian coffee beans', 'active'),
              ('Wheat Flour', 'WHT-002', 45.50, 200, 'Grains', 50, 'High-quality wheat flour for baking', 'active'),
              ('Crude Oil', 'OIL-003', 75.30, 500, 'Energy', 100, 'Light sweet crude oil', 'active'),
              ('Gold', 'GLD-004', 1850.00, 5, 'Precious Metals', 10, '24k gold bullion', 'active'),
              ('Cotton', 'COT-005', 85.20, 300, 'Textiles', 50, 'Premium cotton for textile production', 'active')
          `);

          console.log('Database seeded with demo data');
        }
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Database helper functions
export const runQuery = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const getOne = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const getAll = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export default db; 