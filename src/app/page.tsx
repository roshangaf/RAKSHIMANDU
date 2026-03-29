
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { HeroBanner } from "@/components/home/HeroBanner";
import { AgeVerification } from "@/components/auth/AgeVerification";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product, StoreSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, limit, doc } from "firebase/firestore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const CATEGORIES = [
  { name: 'SPIRITS', id: 'spirit-1', key: 'spiritsImageUrl' },
  { name: 'WINE', id: 'wine-1', key: 'wineImageUrl' },
  { name: 'BEER', id: 'beer-1', key: 'beerImageUrl' },
  { name: 'SNACKS', id: 'snack-1', key: 'snacksImageUrl' },
  { name: 'VAPE AND CIGARETTES', id: 'vape-1', key: 'vapesImageUrl' },
];

export default function Home() {
  const firestore = useFirestore();
  
  const featuredQuery = useMemoFirebase(() => {
    return query(collection(firestore, "products"), limit(6));
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(featuredQuery);
  const { data: storeSettings } = useDoc<StoreSettings>(useMemoFirebase(() => doc(firestore, "settings", "store_config"), [firestore]));

  return (
    <main className="min-h-screen pb-40 overflow-x-hidden">
      <AgeVerification />
      <Navbar />
      <HeroBanner />
      
      {/* Categories Carousel Section */}
      <section className="container mx-auto px-4 mt-16 md:mt-24 relative z-20">
        <div className="flex flex-col mb-8 md:mb-12 text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-headline tracking-tighter uppercase leading-none text-accent">EXPLORE CATEGORIES</h2>
          <div className="h-1 w-16 bg-accent mt-3 mx-auto md:mx-0 rounded-full opacity-50" />
        </div>

        <Carousel 
          opts={{ align: "start", loop: false }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-4">
            {CATEGORIES.map((cat) => {
              const placeholderImg = PlaceHolderImages.find(p => p.id === cat.id);
              const customImgUrl = storeSettings?.[cat.key as keyof StoreSettings] as string;
              const imgUrl = customImgUrl || placeholderImg?.imageUrl;

              return (
                <CarouselItem key={cat.name} className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/4 lg:basis-1/5">
                  <Link href={`/products?category=${cat.name === 'VAPE AND CIGARETTES' ? 'vapes' : cat.name.toLowerCase()}`}>
                    <div className="relative h-40 md:h-48 bg-card hover:bg-secondary border border-white/5 rounded-2xl overflow-hidden group/card transition-all duration-500 cursor-pointer shadow-2xl">
                      {imgUrl && (
                        <Image 
                          src={imgUrl} 
                          alt={cat.name} 
                          fill 
                          className="object-cover opacity-40 group-hover/card:opacity-70 transition-all duration-700 group-hover/card:scale-110"
                          data-ai-hint={placeholderImg?.imageHint || "category image"}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
                      <div className="relative z-10 p-4 md:p-6 flex flex-col justify-end h-full">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-headline text-xl md:text-2xl tracking-wide text-white drop-shadow-2xl leading-none uppercase truncate">{cat.name}</span>
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity backdrop-blur-md border border-white/10 shrink-0">
                            <ChevronRight className="w-5 h-5 text-accent" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 mt-32 md:mt-48">
        <div className="flex flex-col md:flex-row items-baseline md:items-end justify-between mb-16 md:mb-24 gap-8">
          <div className="text-center md:text-left w-full md:w-auto">
            <h2 className="text-6xl md:text-9xl font-headline uppercase leading-[0.85] tracking-tighter">
              {storeSettings?.storeName || "RAKSHIMANDU"} <br className="hidden md:block" />
              <span className="text-accent">EXCLUSIVE</span> COLLECTION
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mt-6 font-light max-w-2xl">Late-night essentials, curated for true night owls and elite connoisseurs.</p>
          </div>
          <Link href="/products" className="w-full md:w-auto">
            <Button variant="link" className="text-accent font-bold p-0 text-lg md:text-xl tracking-[0.3em] uppercase hover:no-underline group">
              VIEW FULL VAULT <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
          {isLoading ? (
            Array.from({length: 3}).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-card animate-pulse rounded-[2rem]" />
            ))
          ) : products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {!isLoading && products?.length === 0 && (
            <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
              <Package className="w-20 h-20 mx-auto text-muted-foreground opacity-20 mb-8" />
              <p className="text-muted-foreground text-2xl uppercase tracking-[0.2em] font-headline">The cellar is currently empty</p>
            </div>
          )}
        </div>
      </section>

      {/* Rewards Teaser */}
      <section className="container mx-auto px-4 mt-32 md:mt-60">
        <div className="bg-gradient-to-br from-primary/95 via-primary/60 to-accent/10 rounded-[3rem] md:rounded-[6rem] p-16 md:p-32 relative overflow-hidden border border-white/10 shadow-3xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 blur-[200px] -mr-64 -mt-64" />
          <div className="relative z-10 max-w-4xl text-center md:text-left flex flex-col items-center md:items-start space-y-10">
            <h2 className="text-7xl md:text-[10rem] font-headline mb-6 uppercase leading-none tracking-tighter">{storeSettings?.clubName || "CLUB घ्याम्पे"}</h2>
            <p className="text-2xl md:text-4xl opacity-90 font-light leading-relaxed drop-shadow-2xl max-w-3xl">Join the valley&apos;s elite late-night society. Earn points on every order, unlock free shipping, and get priority access to our vintage cellar.</p>
            <Link href="/loyalty" className="w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto bg-white text-primary hover:bg-accent hover:text-accent-foreground font-bold px-20 h-20 rounded-full uppercase tracking-[0.2em] text-2xl shadow-3xl transition-all">JOIN THE CLUB</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick delivery notice */}
      {storeSettings?.isOpen247 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 px-6 w-full max-w-md pointer-events-none">
          <div className="bg-accent text-accent-foreground px-10 py-5 rounded-full shadow-3xl flex items-center justify-center gap-6 border-2 border-white/30 whitespace-nowrap backdrop-blur-xl">
            <div className="w-3.5 h-3.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
            <span className="text-sm font-black uppercase tracking-[0.3em]">Active delivery: ~22 mins</span>
          </div>
        </div>
      )}
    </main>
  );
}
