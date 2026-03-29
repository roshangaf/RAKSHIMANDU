import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/Footer";
import { QuickOrderFloating } from "@/components/layout/QuickOrderFloating";
import { FirebaseClientProvider } from "@/firebase";
import { CartProvider } from "@/providers/cart-provider";

export const metadata: Metadata = {
  title: 'RAKSHIMANDU | 24/7 Premium Pairings',
  description: 'Curated liquor and snack pairings delivered rapidly, any time of night.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground flex flex-col min-h-screen overflow-x-hidden">
        <FirebaseClientProvider>
          <CartProvider>
            <div className="flex-grow">
              {children}
            </div>
            <QuickOrderFloating />
            <Footer />
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
