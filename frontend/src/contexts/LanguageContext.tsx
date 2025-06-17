import React, { createContext, useContext, useState, useEffect } from 'react';

// Language type - defines available languages
type Language = 'en' | 'es';

// Translation interface - defines the structure of translation objects
interface Translations {
  // Navigation & Layout
  dashboard: string;
  products: string;
  logout: string;
  
  // Products Page
  manageInventory: string;
  addProduct: string;
  listView: string;
  groupedView: string;
  searchPlaceholder: string;
  allCategories: string;
  allStatus: string;
  active: string;
  inactive: string;
  
  // Product Details
  product: string;
  sku: string;
  stock: string;
  price: string;
  category: string;
  status: string;
  actions: string;
  description: string;
  lowStockThreshold: string;
  
  // Product Form
  addNewProduct: string;
  editProduct: string;
  productName: string;
  stockQuantity: string;
  cancel: string;
  create: string;
  update: string;
  
  // Categories
  beverages: string;
  grains: string;
  energy: string;
  preciousMetals: string;
  textiles: string;
  
  // Actions & Messages
  edit: string;
  delete: string;
  viewOnly: string;
  showMore: string;
  showLess: string;
  totalValue: string;
  noProductsFound: string;
  noProductsMatch: string;
  deleteConfirm: string;
  
  // Dashboard
  overview: string;
  totalProducts: string;
  lowStockItems: string;
  recentActivity: string;
  
  // Auth
  login: string;
  register: string;
  email: string;
  password: string;
  name: string;
  role: string;
  manager: string;
  storeKeeper: string;
}

// English translations
const englishTranslations: Translations = {
  // Navigation & Layout
  dashboard: 'Dashboard',
  products: 'Products',
  logout: 'Logout',
  
  // Products Page
  manageInventory: 'Manage your commodity inventory',
  addProduct: 'Add Product',
  listView: 'List View',
  groupedView: 'Grouped View',
  searchPlaceholder: 'Search products, SKU, or category...',
  allCategories: 'All Categories',
  allStatus: 'All Status',
  active: 'Active',
  inactive: 'Inactive',
  
  // Product Details
  product: 'Product',
  sku: 'SKU',
  stock: 'Stock',
  price: 'Price',
  category: 'Category',
  status: 'Status',
  actions: 'Actions',
  description: 'Description',
  lowStockThreshold: 'Low Stock Threshold',
  
  // Product Form
  addNewProduct: 'Add New Product',
  editProduct: 'Edit Product',
  productName: 'Product Name',
  stockQuantity: 'Stock Quantity',
  cancel: 'Cancel',
  create: 'Create',
  update: 'Update',
  
  // Categories
  beverages: 'Beverages',
  grains: 'Grains',
  energy: 'Energy',
  preciousMetals: 'Precious Metals',
  textiles: 'Textiles',
  
  // Actions & Messages
  edit: 'Edit',
  delete: 'Delete',
  viewOnly: 'View only',
  showMore: 'Show More',
  showLess: 'Show Less',
  totalValue: 'Total Value',
  noProductsFound: 'No products found',
  noProductsMatch: 'No products match your filters',
  deleteConfirm: 'Are you sure you want to delete this product?',
  
  // Dashboard
  overview: 'Overview',
  totalProducts: 'Total Products',
  lowStockItems: 'Low Stock Items',
  recentActivity: 'Recent Activity',
  
  // Auth
  login: 'Login',
  register: 'Register',
  email: 'Email',
  password: 'Password',
  name: 'Name',
  role: 'Role',
  manager: 'Manager',
  storeKeeper: 'Store Keeper',
};

// Spanish translations
const spanishTranslations: Translations = {
  // Navigation & Layout
  dashboard: 'Panel de Control',
  products: 'Productos',
  logout: 'Cerrar Sesión',
  
  // Products Page
  manageInventory: 'Gestiona tu inventario de commodities',
  addProduct: 'Agregar Producto',
  listView: 'Vista de Lista',
  groupedView: 'Vista Agrupada',
  searchPlaceholder: 'Buscar productos, SKU o categoría...',
  allCategories: 'Todas las Categorías',
  allStatus: 'Todos los Estados',
  active: 'Activo',
  inactive: 'Inactivo',
  
  // Product Details
  product: 'Producto',
  sku: 'SKU',
  stock: 'Inventario',
  price: 'Precio',
  category: 'Categoría',
  status: 'Estado',
  actions: 'Acciones',
  description: 'Descripción',
  lowStockThreshold: 'Umbral de Stock Bajo',
  
  // Product Form
  addNewProduct: 'Agregar Nuevo Producto',
  editProduct: 'Editar Producto',
  productName: 'Nombre del Producto',
  stockQuantity: 'Cantidad en Stock',
  cancel: 'Cancelar',
  create: 'Crear',
  update: 'Actualizar',
  
  // Categories
  beverages: 'Bebidas',
  grains: 'Granos',
  energy: 'Energía',
  preciousMetals: 'Metales Preciosos',
  textiles: 'Textiles',
  
  // Actions & Messages
  edit: 'Editar',
  delete: 'Eliminar',
  viewOnly: 'Solo ver',
  showMore: 'Mostrar Más',
  showLess: 'Mostrar Menos',
  totalValue: 'Valor Total',
  noProductsFound: 'No se encontraron productos',
  noProductsMatch: 'Ningún producto coincide con tus filtros',
  deleteConfirm: '¿Estás seguro de que quieres eliminar este producto?',
  
  // Dashboard
  overview: 'Resumen',
  totalProducts: 'Total de Productos',
  lowStockItems: 'Artículos con Stock Bajo',
  recentActivity: 'Actividad Reciente',
  
  // Auth
  login: 'Iniciar Sesión',
  register: 'Registrarse',
  email: 'Correo Electrónico',
  password: 'Contraseña',
  name: 'Nombre',
  role: 'Rol',
  manager: 'Gerente',
  storeKeeper: 'Encargado de Almacén',
};

// Translation map
const translations = {
  en: englishTranslations,
  es: spanishTranslations,
};

// Language context interface - defines available language methods and state
interface LanguageContextType {
  language: Language;                          // Current active language
  setLanguage: (language: Language) => void;   // Function to change language
  t: Translations;                             // Current translations object
  toggleLanguage: () => void;                  // Function to toggle between languages
}

// Create React context for language management
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// LanguageProvider Component - Provides language state and controls to child components
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize language state - check localStorage first, then default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return (savedLanguage === 'en' || savedLanguage === 'es') ? savedLanguage : 'en';
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Set specific language
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  // Toggle between English and Spanish
  const toggleLanguage = () => {
    setLanguageState(prevLanguage => prevLanguage === 'en' ? 'es' : 'en');
  };

  // Get current translations
  const t = translations[language];

  // Context value object - provides language state and methods to consumers
  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for consuming language context - provides type safety and error checking
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}; 