
"use client";

import Image from "next/image";
import { Product, StoreSettings } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Star, ShoppingCart, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { useState } from "react";
import { useCart } from "@/providers/cart-provider";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const firestore = useFirestore();

  // Fetch global settings
  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "store_config"), [firestore]);
  const { data: storeSettings } = useDoc<StoreSettings>(settingsRef);

  const earnedPoints = Math.floor((product.price * qty) / 1000) * 10;

  const handleAddToCart = () => {
    addToCart(product, qty);
    setIsAdded(true);
    
    toast({
      title: "Added to Cart",
      description: `${qty}x ${product.name} is now in your selection.`,
    });

    setTimeout(() => {
      setIsAdded(false);
      setQty(1); // Reset local quantity after adding
    }, 2000);
  };

  const increment = () => setQty(prev => prev + 1);
  const decrement = () => setQty(prev => Math.max(1, prev - 1));

  return (
    <Card className="overflow-hidden bg-card border-border product-card-hover group shadow-xl flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden shrink-0">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint={product.category === 'Snacks' ? "gourmet snacks" : "luxury liquor bottle"}
        />
        <div className="absolute top-2 right-2 md:top-4 md:right-4">
          <div className="bg-black/70 backdrop-blur-md rounded-full px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-1 md:gap-1.5 border border-white/10">
            <Star className="w-2.5 h-2.5 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] md:text-sm font-bold">{product.rating}</span>
          </div>
        </div>
        {product.isAgeRestricted && (
          <div className="absolute top-2 left-2 md:top-4 md:left-4">
            <div className="bg-primary/90 backdrop-blur-sm rounded-full w-6 h-6 md:w-10 md:h-10 flex items-center justify-center text-[8px] md:text-xs font-bold border border-white/20 shadow-xl">
              18+
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-3 md:p-6 flex-grow flex flex-col">
        <p className="text-[8px] md:text-[10px] text-accent font-bold uppercase tracking-[0.2em] mb-1 md:mb-3">{product.category}</p>
        <h3 className="text-sm md:text-2xl font-headline leading-[0.9] uppercase mb-2">{product.name}</h3>
        
        <div className="relative">
          <p className={cn(
            "text-[10px] md:text-sm text-muted-foreground leading-relaxed font-light transition-all duration-300",
            !showFullDescription && "line-clamp-2"
          )}>
            {product.description}
          </p>
          {product.description.length > 50 && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                setShowFullDescription(!showFullDescription);
              }}
              className="flex items-center gap-1 text-[8px] md:text-[10px] text-accent font-black uppercase tracking-widest mt-1 hover:opacity-70 transition-opacity"
            >
              {showFullDescription ? (
                <>SEE LESS <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>SEE MORE <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>
        
        {product.stockQuantity !== undefined && (
          <div className="flex items-center gap-1.5 mt-auto pt-4">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Stock: {product.stockQuantity}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 md:p-6 pt-0 flex flex-col gap-3 md:gap-6 mt-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
          <div className="flex flex-col">
            <span className="text-sm md:text-2xl font-bold tracking-tighter">NRS {product.price.toLocaleString()}</span>
            {earnedPoints > 0 && (
              <span className="text-[8px] md:text-[10px] text-accent/60 font-bold uppercase tracking-widest">
                + {earnedPoints} PTS
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-2 bg-background/50 border border-white/10 rounded-full p-1">
            <button 
              onClick={decrement}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-[10px] md:text-sm font-bold w-4 md:w-6 text-center">{qty}</span>
            <button 
              onClick={increment}
              className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <Button 
          className={`w-full h-10 md:h-12 rounded-xl transition-all shadow-xl border border-white/10 font-headline tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-base ${
            isAdded ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-white/90'
          }`} 
          onClick={handleAddToCart}
        >
          {isAdded ? (
            <><Check className="mr-1 w-3 h-3 md:w-4 md:h-4" /> ADDED</>
          ) : (
            <><Plus className="mr-1 w-3 h-3 md:w-4 md:h-4" /> ADD TO CART</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
