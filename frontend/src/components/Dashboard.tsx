import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Package, 
  Users, 
  AlertTriangle,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';

// Interface for individual product data
interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive';
  lowStockThreshold: number;
}

// Interface for dashboard statistics from API
interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  recentActivities: Array<{
    id: number;
    action: string;
    product: string;
    user: string;
    timestamp: string;
  }>;
}

// Dashboard Component - Manager-only page showing overview statistics and alerts
const Dashboard: React.FC = () => {
  const { state } = useAuth();
  
  // State management for dashboard data
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const API_BASE_URL = 'http://localhost:3001';

  // Helper function to format large numbers for display
  const formatCurrency = (value: number): string => {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(1)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to fetch both dashboard stats and products data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard statistics (manager only endpoint)
      const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      // Fetch products for low stock calculations and recent products table
      const productsResponse = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (statsResponse.ok && productsResponse.ok) {
        const statsData = await statsResponse.json();
        const productsData = await productsResponse.json();
        
        setStats(statsData);
        setProducts(productsData);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate products that are below their low stock threshold
  const lowStockItems = products.filter(product => 
    product.stock <= product.lowStockThreshold
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {state.user?.name}
          </p>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {products.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Low Stock Items Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Low Stock Items
              </p>
              <p className="text-2xl font-bold text-red-600">
                {lowStockItems.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Total Inventory Value Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">
                Total Value
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate" title={`$${products.reduce((total, product) => total + (product.price * product.stock), 0).toLocaleString()}`}>
                {formatCurrency(products.reduce((total, product) => total + (product.price * product.stock), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Product Categories Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Categories
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {[...new Set(products.map(p => p.category))].length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Section - Only show if there are items below threshold */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Low Stock Alerts
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Show up to 5 low stock items */}
              {lowStockItems.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      SKU: {product.sku} | Category: {product.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      Stock: {product.stock} / {product.lowStockThreshold}
                    </p>
                    <p className="text-xs text-gray-500">
                      Below threshold
                    </p>
                  </div>
                </div>
              ))}
              {/* Show count if more than 5 items */}
              {lowStockItems.length > 5 && (
                <p className="text-sm text-gray-600 text-center">
                  And {lowStockItems.length - 5} more items...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Products
          </h2>
        </div>
        <div className="p-6">
          {products.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            // Products table
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Product
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      SKU
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Stock
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show first 5 products or all products based on state */}
                  {(showAllProducts ? products : products.slice(0, 5)).map((product) => (
                    <tr key={product.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {product.category}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {product.sku}
                      </td>
                      <td className="py-3 px-4">
                        {/* Color-coded stock badge based on threshold */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock <= product.lowStockThreshold
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-3 px-4">
                        {/* Status badge */}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Show toggle button if more than 5 products */}
              {products.length > 5 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {showAllProducts 
                      ? `Showing all ${products.length} products`
                      : `Showing 5 of ${products.length} products`
                    }
                  </p>
                  <button
                    onClick={() => setShowAllProducts(!showAllProducts)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {showAllProducts ? 'Show Less' : 'Show All'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 