'use client';

import { useState, useCallback, ReactNode } from 'react';
import { createContext, useContext } from 'react';

interface FeaturedContextType {
  featured: any[];
  addFeatured: (product: any) => void;
  removeFeatured: (productId: string) => void;
  setFeatured: (products: any[]) => void;
}

const FeaturedContext = createContext<FeaturedContextType | undefined>(undefined);

export const FeaturedProvider = ({ children }: { children: ReactNode }) => {
  const [featured, setFeaturedState] = useState<any[]>([]);

  const addFeatured = useCallback((product: any) => {
    setFeaturedState(prev => {
      const exists = prev.find(p => p._id === product._id);
      return exists ? prev : [...prev, product];
    });
  }, []);

  const removeFeatured = useCallback((productId: string) => {
    setFeaturedState(prev => prev.filter(p => p._id !== productId));
  }, []);

  const setFeatured = useCallback((products: any[]) => {
    setFeaturedState(products);
  }, []);

  return (
    <FeaturedContext.Provider value={{ featured, addFeatured, removeFeatured, setFeatured }}>
      {children}
    </FeaturedContext.Provider>
  );
};

export const useFeatured = () => {
  const context = useContext(FeaturedContext);
  if (!context) {
    throw new Error('useFeatured must be used inside FeaturedProvider');
  }
  return context;
};
