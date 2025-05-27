import React, { createContext, useContext, useState, useEffect } from 'react';

// Theme type - defines available theme options
type Theme = 'light' | 'dark';

// Theme context interface - defines available theme methods and state
interface ThemeContextType {
  theme: Theme;                    // Current active theme
  toggleTheme: () => void;         // Function to switch between themes
  setTheme: (theme: Theme) => void; // Function to set specific theme
}

// Create React context for theme management
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider Component - Provides theme state and controls to child components
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme state - check localStorage first, then default to light
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
  });

  // Apply theme to HTML document on theme change
  useEffect(() => {
    const root = document.documentElement;
    
    // Always remove dark class first
    root.classList.remove('dark');
    
    if (theme === 'dark') {
      root.classList.add('dark');
      console.log('Applied dark mode');
    } else {
      console.log('Applied light mode');
    }
    
    // Save to localStorage so it persists
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setThemeState(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Set specific theme (useful for direct theme selection)
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Context value object - provides theme state and methods to consumers
  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for consuming theme context - provides type safety and error checking
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}; 