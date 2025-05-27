import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcrypt';
import { initializeDatabase, seedDatabase, getOne, getAll, runQuery, User, Product } from './database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory sessions (for demo - in production use Redis)
let sessions: { [token: string]: { userId: number; role: string; email: string; expiresAt: Date } } = {};

// Helper function to generate simple token
const generateToken = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Middleware to check authentication
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const session = sessions[token];
  if (!session || session.expiresAt < new Date()) {
    // Clean up expired session
    if (session) delete sessions[token];
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = session;
  next();
};

// Middleware to check role
const checkRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Authentication Routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['Manager', 'Store Keeper'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await getOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await runQuery(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.id,
        email,
        name,
        role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getOne('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    sessions[token] = { 
      userId: user.id, 
      role: user.role, 
      email: user.email,
      expiresAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/logout', authenticateToken, (req: any, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token && sessions[token]) {
    delete sessions[token];
  }
  
  res.json({ message: 'Logout successful' });
});

app.get('/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await getOne('SELECT id, email, name, role FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Management Routes (Manager only)
app.get('/users', authenticateToken, checkRole(['Manager']), async (req, res) => {
  try {
    const users = await getAll('SELECT id, email, name, role, createdAt, updatedAt FROM users ORDER BY createdAt DESC');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/users/:id', authenticateToken, checkRole(['Manager']), async (req: any, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent deleting own account
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await runQuery('DELETE FROM users WHERE id = ?', [userId]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard Routes (Manager only)
app.get('/dashboard/stats', authenticateToken, checkRole(['Manager']), async (req, res) => {
  try {
    const products = await getAll('SELECT * FROM products');
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold).length;

    const categoryStats = products.reduce((acc: any, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalProducts,
      totalValue: totalValue.toFixed(2),
      lowStockItems: lowStockProducts,
      categoryStats,
      recentActivities: [
        { id: 1, action: 'Product Updated', product: 'Coffee Beans', user: 'John Manager', timestamp: '2 hours ago' },
        { id: 2, action: 'New Product Added', product: 'Silver', user: 'Jane Keeper', timestamp: '5 hours ago' },
        { id: 3, action: 'Stock Alert', product: 'Gold', user: 'System', timestamp: '1 day ago' },
      ]
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Product Routes
app.get('/products', authenticateToken, async (req, res) => {
  try {
    const products = await getAll('SELECT * FROM products ORDER BY createdAt DESC');
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await getOne('SELECT * FROM products WHERE id = ?', [parseInt(req.params.id)]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/products', authenticateToken, checkRole(['Manager']), async (req, res) => {
  try {
    const { name, sku, price, stock, category, status, lowStockThreshold, description } = req.body;

    if (!name || !sku || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ error: 'Name, SKU, price, stock, and category are required' });
    }

    // Check if SKU already exists
    const existingProduct = await getOne('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existingProduct) {
      return res.status(409).json({ error: 'Product with this SKU already exists' });
    }

    const result = await runQuery(`
      INSERT INTO products (name, sku, price, stock, category, status, lowStockThreshold, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, 
      sku, 
      parseFloat(price), 
      parseInt(stock), 
      category, 
      status || 'active', 
      parseInt(lowStockThreshold) || 10,
      description || null
    ]);

    const newProduct = await getOne('SELECT * FROM products WHERE id = ?', [result.id]);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/products/:id', authenticateToken, checkRole(['Manager']), async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { name, sku, price, stock, category, status, lowStockThreshold, description } = req.body;

    // Check if product exists
    const existingProduct = await getOne('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if SKU is being changed and if it conflicts with another product
    if (sku && sku !== existingProduct.sku) {
      const skuConflict = await getOne('SELECT id FROM products WHERE sku = ? AND id != ?', [sku, productId]);
      if (skuConflict) {
        return res.status(409).json({ error: 'Product with this SKU already exists' });
      }
    }

    await runQuery(`
      UPDATE products 
      SET name = ?, sku = ?, price = ?, stock = ?, category = ?, 
          status = ?, lowStockThreshold = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name || existingProduct.name,
      sku || existingProduct.sku,
      price !== undefined ? parseFloat(price) : existingProduct.price,
      stock !== undefined ? parseInt(stock) : existingProduct.stock,
      category || existingProduct.category,
      status || existingProduct.status,
      lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : existingProduct.lowStockThreshold,
      description !== undefined ? description : existingProduct.description,
      productId
    ]);

    const updatedProduct = await getOne('SELECT * FROM products WHERE id = ?', [productId]);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/products/:id', authenticateToken, checkRole(['Manager']), async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM products WHERE id = ?', [parseInt(req.params.id)]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Slooze Commodities Management System API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    await seedDatabase();
    console.log('✅ Database seeded');

    app.listen(PORT, () => {
      console.log(`🚀 Slooze Commodities API running on http://localhost:${PORT}`);
      console.log(`📚 Demo credentials:`);
      console.log(`   Manager: manager@slooze.xyz / manager123`);
      console.log(`   Store Keeper: keeper@slooze.xyz / keeper123`);
      console.log(`📊 Features available:`);
      console.log(`   - User registration: POST /auth/register`);
      console.log(`   - User management: GET /users (Manager only)`);
      console.log(`   - Product management with persistent storage`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 