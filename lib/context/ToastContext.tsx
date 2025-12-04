'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string | number;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  push: (message: string, opts?: Partial<Toast>) => void;
  remove: (id: string | number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, opts: Partial<Toast> = {}) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type: 'success', ...opts }]);
    if (!opts.persistent) {
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration || 4000);
    }
  }, []);

  const remove = useCallback((id: string | number) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};
