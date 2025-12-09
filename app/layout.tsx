import type { Metadata } from "next";
import "@/styles/globals.css";
import ClientProviders from "./client-providers";
import fs from "fs";
import path from "path";

async function getBrandingData() {
  try {
    // Try to read from branding JSON file (cached)
    const brandingPath = path.join(process.cwd(), "public", "branding.json");
    if (fs.existsSync(brandingPath)) {
      const data = fs.readFileSync(brandingPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    // Silently fail, use defaults
  }

  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingData();

  return {
    title: branding?.pageTitle || "Nova - E-commerce Platform",
    description: branding?.pageDescription || "Premium e-commerce platform for shopping",
    keywords: ["ecommerce", "shopping", "products", "deals"],
    openGraph: {
      title: branding?.pageTitle || "Nova - E-commerce Platform",
      description: branding?.pageDescription || "Premium e-commerce platform for shopping",
      type: "website",
    },
  };
}

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
