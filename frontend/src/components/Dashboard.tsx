import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();
  
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.dashboard}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {state.user?.name}
          </p>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t.totalProducts}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {products.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Low Stock Items Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t.lowStockItems}
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {lowStockItems.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Total Inventory Value Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t.totalValue}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate" title={`$${products.reduce((total, product) => total + (product.price * product.stock), 0).toLocaleString()}`}>
                {formatCurrency(products.reduce((total, product) => total + (product.price * product.stock), 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Active Products Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t.active} {t.products}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {products.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
              {t.lowStockItems}
            </h2>
          </div>
          <div className="space-y-2">
            {lowStockItems.slice(0, 5).map((product) => (
              <div key={product.id} className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    {product.stock} {t.stock.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Threshold: {product.lowStockThreshold}
                  </p>
                </div>
              </div>
            ))}
            {lowStockItems.length > 5 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                And {lowStockItems.length - 5} more items need attention
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.recentActivity}
            </h2>
            <button
              onClick={() => setShowAllProducts(!showAllProducts)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              {showAllProducts ? 'Show Less' : `View All (${products.length})`}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                  {t.product}
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                  {t.category}
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                  {t.stock}
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                  {t.price}
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900 dark:text-white">
                  {t.status}
                </th>
              </tr>
            </thead>
            <tbody>
              {(showAllProducts ? products : products.slice(0, 10)).map((product) => (
                <tr key={product.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.sku}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                    {product.category}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock <= product.lowStockThreshold
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {product.stock}
                      </span>
                      {product.stock <= product.lowStockThreshold && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {product.status === 'active' ? t.active : t.inactive}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 