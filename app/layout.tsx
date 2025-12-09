import type { Metadata } from "next";
import "@/styles/globals.css";
import ClientProviders from "./client-providers";

export const metadata: Metadata = {
  title: "Nova - E-commerce Platform",
  description: "Premium e-commerce platform for shopping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
