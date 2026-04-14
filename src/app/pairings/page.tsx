
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Product, Pairing } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Wine, Package, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function PairingsPage() {
  const [viewingPairing, setViewingPairing] = useState<Pairing | null>(null);
  const firestore = useFirestore();
  
  const pairingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "pairings");
  }, [firestore]);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "products");
  }, [firestore]);

  const { data: pairings, isLoading: isPairingsLoading } = useCollection<Pairing>(pairingsQuery);
  const { data: products, isLoading: isProductsLoading } = useCollection<Product>(productsQuery);

  const selectedLiquor = viewingPairing ? products?.find(p => p.id === viewingPairing.liquorProductId) : null;
  const selectedSnack = viewingPairing ? products?.find(p => p.id === viewingPairing.snackProductId) : null;

  const isLoading = isPairingsLoading || isProductsLoading;

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <header className="max-w-3xl mb-16 space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 text-accent animate-pulse">
            <Sparkles className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-[0.4em]">Expertly Curated</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline tracking-tighter leading-[0.85] flex flex-wrap items-baseline justify-center md:justify-start gap-x-4">
            PERFECT <span className="text-accent text-[0.7em] md:text-[0.65em] opacity-90 leading-none">कम्बो</span>
          </h1>
          <p className="text-muted-foreground text-xl font-light leading-relaxed">
            We've done the science of the night for you. Discover our curated sets of fine liquors and artisan snacks, balanced to perfection.
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {pairings?.map((pairing) => (
              <div key={pairing.id} className="bg-card border border-white/5 rounded-[3rem] p-10 md:p-12 space-y-10 hover:border-accent/20 transition-all group shadow-3xl flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-accent/5 flex items-center justify-center border border-white/5 group-hover:bg-accent transition-colors duration-700 overflow-hidden shadow-2xl">
                  {pairing.imageUrl ? (
                    <img src={pairing.imageUrl} alt={pairing.name} className="w-full h-full object-cover" />
                  ) : (
                    <Wine className="w-16 h-16 md:w-24 md:h-24 text-accent group-hover:text-black transition-colors duration-500" />
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl md:text-6xl font-headline tracking-wide uppercase leading-none">{pairing.name}</h3>
                  <p className="text-muted-foreground font-light text-lg md:text-xl leading-relaxed">{pairing.description}</p>
                </div>
                <div className="pt-8 border-t border-white/10 w-full">
                  <Button 
                    onClick={() => setViewingPairing(pairing)}
                    variant="outline" 
                    className="w-full rounded-2xl border-white/10 font-bold uppercase tracking-[0.3em] text-sm h-16 hover:bg-white hover:text-black transition-all shadow-xl"
                  >
                    View Components
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!pairings || pairings.length === 0) && (
          <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
            <Package className="w-20 h-20 mx-auto text-muted-foreground opacity-20 mb-8" />
            <p className="text-muted-foreground text-2xl uppercase tracking-[0.2em] font-headline">No curated pairings found</p>
            <p className="text-base text-muted-foreground/60 mt-4 font-light">New combos are added nightly by our sommelier.</p>
          </div>
        )}

        <Dialog open={!!viewingPairing} onOpenChange={(open) => !open && setViewingPairing(null)}>
          <DialogContent className="max-w-5xl bg-card border-white/10 p-0 overflow-y-auto max-h-[90vh] rounded-[3rem] flex flex-col">
            <DialogHeader className="p-8 md:p-10 pb-4 shrink-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-accent mb-2">
                <Wine className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Inside the Combo</span>
              </div>
              <DialogTitle className="text-4xl md:text-7xl font-headline text-white uppercase leading-none">
                {viewingPairing?.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-light text-base md:text-2xl mt-2">
                {viewingPairing?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="p-8 md:p-10 pt-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 items-start">
                {selectedLiquor ? (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1 text-center sm:text-left">THE SPIRIT</p>
                    <ProductCard product={selectedLiquor} />
                  </div>
                ) : (
                  <div className="aspect-[4/5] bg-white/5 rounded-[2rem] flex items-center justify-center border border-dashed border-white/10">
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest">Liquor not found</p>
                  </div>
                )}

                {selectedSnack ? (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 ml-1 text-center sm:text-left">THE PAIRING</p>
                    <ProductCard product={selectedSnack} />
                  </div>
                ) : (
                  <div className="aspect-[4/5] bg-white/5 rounded-[2rem] flex items-center justify-center border border-dashed border-white/10">
                    <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest">Snack not found</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <section className="mt-40 p-16 md:p-24 bg-primary/20 rounded-[4rem] border border-white/5 relative overflow-hidden shadow-3xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Wine className="w-96 h-96 -rotate-12" />
          </div>
          <div className="relative z-10 max-w-3xl text-center md:text-left space-y-8 flex flex-col items-center md:items-start">
            <h2 className="text-5xl md:text-8xl font-headline leading-none uppercase">WANT A CUSTOM <span className="text-accent">PAIRING?</span></h2>
            <p className="text-muted-foreground text-xl md:text-2xl font-light leading-relaxed">
              Chat with our night sommelier. They're online now and ready to suggest the perfect snack for your choice of spirit.
            </p>
            <Button 
              onClick={() => window.location.href = '/support'}
              size="lg" 
              className="bg-white text-black hover:bg-accent hover:text-white font-bold px-16 h-20 rounded-full text-xl uppercase tracking-widest shadow-2xl transition-all"
            >
              CHAT WITH AN EXPERT
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
