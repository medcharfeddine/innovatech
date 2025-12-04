'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  images?: string[];
  imageUrl?: string;
  [key: string]: any;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, qty: number = 1) => {
    setCart(prev => {
      const found = prev.find(p => p._id === product._id);
      if (found) {
        return prev.map(p => 
          p._id === product._id 
            ? { ...p, quantity: (p.quantity || 1) + qty } 
            : p
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    setCart(prev => {
      if (qty <= 0) return prev.filter(p => p._id !== id);
      return prev.map(p => p._id === id ? { ...p, quantity: qty } : p);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
};
