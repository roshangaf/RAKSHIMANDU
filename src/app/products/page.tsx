
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Category, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Search, MoveRight, Tag, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

const CATEGORIES: (Category | 'All')[] = ['All', 'Spirits', 'Wine', 'Beer', 'Snacks', 'Vapes', 'Bundles'];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedBrand, setSelectedBrand] = useState<string | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const firestore = useFirestore();

  useEffect(() => {
    if (initialCategory) {
      const matched = CATEGORIES.find(
        c => c.toLowerCase() === initialCategory.toLowerCase()
      );
      if (matched) {
        setSelectedCategory(matched as Category);
      }
    }
  }, [initialCategory]);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const colRef = collection(firestore, "products");
    if (selectedCategory === 'All') return colRef;
    return query(colRef, where("category", "==", selectedCategory));
  }, [firestore, selectedCategory]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const brands = useMemo(() => {
    if (!products) return ['All'];
    const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));
    return ['All', ...uniqueBrands.sort()];
  }, [products]);

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  }) || [];

  const handlePullCord = () => {
    if (isPulling) return;
    setIsPulling(true);
    setTimeout(() => {
      const currentIndex = CATEGORIES.indexOf(selectedCategory);
      const nextIndex = (currentIndex + 1) % CATEGORIES.length;
      setSelectedCategory(CATEGORIES[nextIndex]);
      setIsPulling(false);
    }, 200);
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-20">
      <header className="mb-20 space-y-16">
        {/* Filters and Pull Cord moved to the top */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between pb-16 border-b border-white/5">
          <div className="flex flex-col md:flex-row gap-6 flex-1 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                className="pl-14 bg-card border-white/5 h-16 rounded-2xl shadow-2xl focus:ring-accent/50 text-lg" 
                placeholder="Search the cellar..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-80">
              <Tag className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full h-16 bg-card border border-white/5 rounded-2xl pl-14 pr-6 text-lg focus:ring-accent/50 appearance-none cursor-pointer"
              >
                <option value="All">All Brands</option>
                {brands.filter(b => b !== 'All').map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-xs font-bold tracking-[0.4em] text-accent uppercase opacity-60">Pull cord for category</p>
              
              <div 
                onClick={handlePullCord}
                className="relative flex items-center cursor-pointer group/cord-container"
              >
                <div className="relative h-1.5 w-48 md:w-72 bg-gradient-to-r from-transparent via-primary to-primary rounded-full overflow-hidden transition-opacity group-hover/cord-container:opacity-80">
                  <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,black_6px,black_12px)]" />
                </div>

                <div 
                  className={cn(
                    "absolute right-12 md:right-20 px-6 py-2 bg-card border-2 border-primary rounded-full shadow-2xl transition-all duration-300 transform",
                    isPulling ? "translate-x-4 scale-90 opacity-50" : "translate-x-0 scale-100",
                    "group-hover/cord-container:border-accent group-hover/cord-container:shadow-accent/40"
                  )}
                >
                  <span className="font-headline text-2xl tracking-[0.2em] text-white whitespace-nowrap uppercase">{selectedCategory}</span>
                </div>

                <div 
                  className={cn(
                    "relative z-10 w-12 h-12 rounded-full bg-primary border-4 border-background flex items-center justify-center transition-all duration-200 shadow-2xl",
                    isPulling ? "translate-x-3" : "translate-x-0",
                    "group-active/cord-container:scale-90"
                  )}
                >
                  <MoveRight className="w-5 h-5 text-white animate-pulse" />
                  <div className="absolute top-full mt-[-2px] flex flex-col items-center">
                    <div className="w-0.5 h-4 bg-primary" />
                    <div className="w-4 h-6 bg-primary rounded-b-xl opacity-80" />
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em] mt-6 text-center w-full">
                Next: <span className="text-white font-black">{CATEGORIES[(CATEGORIES.indexOf(selectedCategory) + 1) % CATEGORIES.length].toUpperCase()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Heading and description shifted below the filters */}
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-6xl md:text-9xl font-headline tracking-tighter uppercase leading-none">OUR COLLECTION</h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl font-light mx-auto md:mx-0 leading-relaxed">Explore our curated selection of fine spirits, craft beers, and artisan pairings delivered to your door.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 animate-in fade-in duration-500">
        {isLoading ? (
           Array.from({length: 3}).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-card animate-pulse rounded-[2rem]" />
          ))
        ) : filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="col-span-full py-32 text-center space-y-8 border-2 border-dashed border-white/5 rounded-[4rem]">
            <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Search className="w-12 h-12 text-muted-foreground opacity-20" />
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground text-3xl font-headline uppercase tracking-widest">No products found</p>
              <p className="text-muted-foreground/60 max-w-md mx-auto font-light">We couldn't find anything matching your current filters. Try adjusting your search or clearing filters.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {setSelectedCategory('All'); setSelectedBrand('All'); setSearchQuery('');}} 
              className="border-accent/20 text-accent hover:bg-accent hover:text-white rounded-full px-12 h-14 text-lg font-headline tracking-widest transition-all"
            >
              RESET CELLAR FILTERS
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-40 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-16 h-16 text-accent animate-spin" />
          <p className="font-headline text-2xl uppercase tracking-widest opacity-40">Opening the Vault...</p>
        </div>
      }>
        <CatalogContent />
      </Suspense>
    </main>
  );
}
