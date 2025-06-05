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
              -- Beverages
              ('Coffee Beans', 'COF-001', 25.99, 150, 'Beverages', 20, 'Premium Colombian coffee beans', 'active'),
              ('Coffee Beans', 'COF-027', 18.75, 280, 'Beverages', 25, 'Brazilian Arabica coffee beans', 'active'),
              ('Coffee Beans', 'COF-028', 32.40, 95, 'Beverages', 15, 'Ethiopian single-origin coffee beans', 'active'),
              
              -- Grains
              ('Wheat Flour', 'WHT-002', 45.50, 200, 'Grains', 50, 'High-quality wheat flour for baking', 'active'),
              ('Wheat Flour', 'WHT-029', 38.25, 350, 'Grains', 60, 'All-purpose wheat flour', 'active'),
              ('Wheat Flour', 'WHT-030', 52.80, 120, 'Grains', 30, 'Organic stone-ground wheat flour', 'active'),
              ('Corn', 'CRN-006', 32.75, 800, 'Grains', 100, 'Yellow dent corn for feed and processing', 'active'),
              ('Corn', 'CRN-031', 28.90, 650, 'Grains', 80, 'White corn for human consumption', 'active'),
              ('Corn', 'CRN-032', 35.60, 420, 'Grains', 70, 'Non-GMO sweet corn', 'active'),
              ('Rice', 'RIC-007', 28.90, 450, 'Grains', 75, 'Long grain white rice', 'active'),
              ('Rice', 'RIC-033', 34.25, 380, 'Grains', 65, 'Basmati rice premium grade', 'active'),
              ('Rice', 'RIC-034', 42.15, 220, 'Grains', 40, 'Organic brown rice', 'active'),
              ('Barley', 'BAR-008', 22.40, 320, 'Grains', 60, 'Six-row barley for malting and feed', 'active'),
              ('Barley', 'BAR-035', 26.80, 280, 'Grains', 50, 'Two-row malting barley', 'active'),
              ('Oats', 'OAT-009', 19.85, 275, 'Grains', 40, 'Rolled oats for human consumption', 'active'),
              ('Oats', 'OAT-036', 24.60, 195, 'Grains', 35, 'Steel-cut oats premium quality', 'active'),
              ('Quinoa', 'QUI-010', 156.20, 85, 'Grains', 15, 'Organic white quinoa superfood', 'active'),
              ('Quinoa', 'QUI-037', 142.90, 110, 'Grains', 20, 'Red quinoa from Bolivia', 'active'),
              
              -- Energy
              ('Crude Oil', 'OIL-003', 75.30, 500, 'Energy', 100, 'Light sweet crude oil', 'active'),
              ('Crude Oil', 'OIL-038', 72.85, 420, 'Energy', 90, 'Heavy crude oil', 'active'),
              ('Crude Oil', 'OIL-039', 78.60, 350, 'Energy', 80, 'Brent crude oil', 'active'),
              ('Natural Gas', 'GAS-011', 4.25, 1200, 'Energy', 200, 'Henry Hub natural gas futures', 'active'),
              ('Natural Gas', 'GAS-040', 3.98, 950, 'Energy', 180, 'European natural gas', 'active'),
              ('Coal', 'COL-012', 89.60, 750, 'Energy', 150, 'Thermal coal for power generation', 'active'),
              ('Coal', 'COL-041', 95.20, 620, 'Energy', 120, 'Metallurgical coal for steel', 'active'),
              ('Coal', 'COL-042', 78.40, 890, 'Energy', 170, 'Sub-bituminous coal', 'active'),
              ('Ethanol', 'ETH-013', 2.85, 400, 'Energy', 80, 'Fuel-grade ethanol biofuel', 'active'),
              ('Ethanol', 'ETH-043', 2.92, 320, 'Energy', 65, 'Industrial ethanol 95%', 'active'),
              ('Heating Oil', 'HTO-014', 2.92, 350, 'Energy', 70, 'Ultra-low sulfur heating oil', 'active'),
              ('Gasoline', 'GAS-015', 2.76, 600, 'Energy', 120, 'Reformulated gasoline blendstock', 'active'),
              ('Gasoline', 'GAS-044', 2.68, 520, 'Energy', 100, 'Regular unleaded gasoline', 'active'),
              
              -- Precious Metals
              ('Gold', 'GLD-004', 1850.00, 5, 'Precious Metals', 10, '24k gold bullion', 'active'),
              ('Gold', 'GLD-045', 1820.50, 8, 'Precious Metals', 3, '22k gold jewelry grade', 'active'),
              ('Gold', 'GLD-046', 1785.20, 12, 'Precious Metals', 5, '18k gold alloy', 'active'),
              ('Silver', 'SLV-016', 23.45, 25, 'Precious Metals', 5, '999 fine silver bars', 'active'),
              ('Silver', 'SLV-047', 22.85, 35, 'Precious Metals', 8, '925 sterling silver', 'active'),
              ('Silver', 'SLV-048', 21.90, 45, 'Precious Metals', 10, 'Industrial silver grade', 'active'),
              ('Platinum', 'PLT-017', 985.20, 8, 'Precious Metals', 3, 'Investment grade platinum', 'active'),
              ('Platinum', 'PLT-049', 945.80, 6, 'Precious Metals', 2, 'Automotive grade platinum', 'active'),
              ('Palladium', 'PAL-018', 1245.75, 12, 'Precious Metals', 4, 'Palladium for automotive catalysts', 'active'),
              ('Palladium', 'PAL-050', 1198.60, 9, 'Precious Metals', 3, 'Investment palladium bars', 'active'),
              ('Copper', 'COP-019', 3.89, 150, 'Precious Metals', 25, 'High-grade copper cathodes', 'active'),
              ('Copper', 'COP-051', 3.76, 220, 'Precious Metals', 35, 'Copper wire rod', 'active'),
              ('Copper', 'COP-052', 3.95, 180, 'Precious Metals', 30, 'Electrolytic copper', 'active'),
              ('Rhodium', 'RHO-020', 4850.00, 2, 'Precious Metals', 1, 'Ultra-rare rhodium metal', 'active'),
              
              -- Textiles
              ('Cotton', 'COT-005', 85.20, 300, 'Textiles', 50, 'Premium cotton for textile production', 'active'),
              ('Cotton', 'COT-053', 78.95, 420, 'Textiles', 70, 'Organic cotton fiber', 'active'),
              ('Cotton', 'COT-054', 72.40, 580, 'Textiles', 90, 'Standard cotton lint', 'active'),
              ('Cotton', 'COT-055', 92.80, 240, 'Textiles', 40, 'Pima cotton extra-long staple', 'active'),
              ('Wool', 'WOL-021', 142.80, 180, 'Textiles', 30, 'Merino wool for premium garments', 'active'),
              ('Wool', 'WOL-056', 128.50, 220, 'Textiles', 40, 'Crossbred wool medium grade', 'active'),
              ('Wool', 'WOL-057', 95.30, 350, 'Textiles', 60, 'Carpet wool coarse grade', 'active'),
              ('Silk', 'SLK-022', 2850.00, 45, 'Textiles', 8, 'Mulberry silk fabric grade A', 'active'),
              ('Silk', 'SLK-058', 2620.00, 55, 'Textiles', 10, 'Tussah silk wild variety', 'active'),
              ('Linen', 'LIN-023', 195.50, 120, 'Textiles', 20, 'European flax linen fibers', 'active'),
              ('Linen', 'LIN-059', 168.90, 160, 'Textiles', 25, 'Belgian linen medium grade', 'active'),
              ('Hemp', 'HMP-024', 78.90, 220, 'Textiles', 35, 'Industrial hemp fiber for textiles', 'active'),
              ('Hemp', 'HMP-060', 85.60, 180, 'Textiles', 30, 'Organic hemp fiber', 'active'),
              ('Polyester', 'POL-025', 1.45, 500, 'Textiles', 100, 'Recycled polyester staple fiber', 'active'),
              ('Polyester', 'POL-061', 1.32, 650, 'Textiles', 120, 'Virgin polyester fiber', 'active'),
              ('Polyester', 'POL-062', 1.58, 420, 'Textiles', 80, 'High-tenacity polyester', 'active'),
              ('Jute', 'JUT-026', 95.30, 160, 'Textiles', 25, 'Raw jute fiber for bags and carpets', 'active'),
              ('Jute', 'JUT-063', 88.75, 200, 'Textiles', 35, 'Processed jute fiber', 'active')
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