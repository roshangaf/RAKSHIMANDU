
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Clock, Bike } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { StoreSettings } from "@/lib/types";

export function HeroBanner() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isBikeAnimating, setIsBikeAnimating] = useState(false);
  
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "store_config"), [firestore]);
  const { data: storeSettings } = useDoc<StoreSettings>(settingsRef);

  const placeholderHero = PlaceHolderImages.find(img => img.id === 'hero-liquor');
  const heroImageUrl = storeSettings?.heroImageUrl || placeholderHero?.imageUrl;

  const heroTitle = storeSettings?.heroTitle || "CRAVINGS DON'T SLEEP. NEITHER DO WE.";
  const heroSubtitle = storeSettings?.heroSubtitle || "Premium drinks and snacks, delivered across Kathmandu, Lalitpur, and Bhaktapur in 30 minutes";

  const triggerBike = () => {
    if (isBikeAnimating) return;
    setIsBikeAnimating(true);
    setTimeout(() => setIsBikeAnimating(false), 1500);
  };

  return (
    <div className="relative min-h-[95vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Optimized Background Image */}
      {heroImageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImageUrl}
            alt="Premium Hero"
            fill
            className="object-cover brightness-[0.7] md:brightness-100"
            priority
            data-ai-hint="luxury bar"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80" />
        </div>
      )}
      
      {/* Bike Animation Overlay */}
      {isBikeAnimating && (
        <div className="fixed top-1/2 left-0 z-[100] pointer-events-none animate-bike-pass">
          < Bike className="w-12 h-12 md:w-16 md:h-16 text-accent drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10 pt-20 md:pt-0">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 md:space-y-8">
          <div 
            onClick={triggerBike}
            onTouchStart={triggerBike}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent animate-pulse cursor-pointer hover:bg-accent/20 transition-all active:scale-95 select-none"
          >
            <Zap className="w-4 h-4" />
            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">24/7 Rapid Delivery</span>
          </div>
          
          <h1 className="text-5xl md:text-9xl font-headline leading-[0.9] md:leading-[0.85] tracking-tighter drop-shadow-2xl uppercase">
            {heroTitle.split('. ').map((part, i, arr) => (
              <span key={i}>
                {part}{i < arr.length - 1 ? '.' : ''}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
          
          <p className="text-base md:text-xl text-white/90 max-w-2xl font-body font-light leading-relaxed drop-shadow-lg px-4 md:px-0">
            {heroSubtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-4 w-full px-4 md:px-0">
            <Link href="/products" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-12 h-14 text-lg shadow-xl">
                BROWSE ITEM <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            
            <div 
              className="w-full sm:w-auto"
              onMouseEnter={() => setIsPopoverOpen(true)}
              onMouseLeave={() => setIsPopoverOpen(false)}
            >
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 h-14 rounded-full bg-black/40 border border-white/10 backdrop-blur-md cursor-pointer hover:bg-black/60 transition-colors group">
                    <Clock className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold tracking-tight uppercase">Avg. Delivery: 24 mins</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[90vw] max-w-80 border-white/10 bg-card p-0 overflow-hidden shadow-2xl"
                  onMouseEnter={() => setIsPopoverOpen(true)}
                  onMouseLeave={() => setIsPopoverOpen(false)}
                >
                  <div className="bg-primary/40 p-3 border-b border-white/5">
                    <p className="text-[10px] font-bold text-white tracking-[0.2em] uppercase">Real-time status</p>
                  </div>
                  <div className="p-4 space-y-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-white/5 overflow-hidden">
                        <Image 
                          src="https://picsum.photos/seed/driver1/100/100" 
                          alt="Courier" 
                          width={48} 
                          height={48}
                          className="object-cover"
                          data-ai-hint="delivery driver"
                        />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Nearest Buddy</p>
                        <p className="font-headline text-xl leading-none">SHER BAHADUR</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-green-400 font-bold uppercase">Ready to roll</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                        We deliver to all areas within the valley. Sher Bahadur is currently stationed nearby.
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="text-center flex-1 border-r border-white/5">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Speed</p>
                          <p className="font-headline text-lg text-accent">RAPID</p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Distance</p>
                          <p className="font-headline text-lg text-accent">0.8 MI</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
