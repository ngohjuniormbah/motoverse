import "./globals.css";
import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import { LiveChat } from "@/components/LiveChat";

const display = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Motoverse — Spare Parts for Every Car, Shipped Nationwide",
  description: "Find and order genuine and aftermarket spare parts for all car makes. Browse by brand, search by part, and we ship to all 50 states. No account needed.",
  keywords: ["car spare parts", "auto parts online", "OEM parts", "aftermarket car parts", "Ford parts", "Honda parts", "Toyota parts", "Motoverse"],
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-sans">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <LiveChat />
        </CartProvider>
      </body>
    </html>
  );
}
