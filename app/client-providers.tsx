'use client';

import { ReactNode } from 'react';
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import Toasts from "@/components/Toasts";
import { CartProvider } from "@/lib/context/CartContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import { FeaturedProvider } from "@/lib/context/FeaturedContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <FeaturedProvider>
              <Header />
              <main>{children}</main>
              <Footer />
              <Toasts />
            </FeaturedProvider>
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
