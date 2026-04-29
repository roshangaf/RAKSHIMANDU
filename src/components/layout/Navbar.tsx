
"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Menu, Moon, ShoppingBag, ShieldCheck, Trash2, Plus, Minus, Loader2, ArrowLeft, X, Phone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc, increment } from "firebase/firestore";
import { Order, StoreSettings, UserProfile } from "@/lib/types";
import { useMemo, useState } from "react";
import { useCart } from "@/providers/cart-provider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_LOGO = "https://images.unsplash.com/photo-1777465850484-f85942902c64?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwcm9maWxlLXBhZ2V8MXx8fGVufDB8fHx8fA%3D%3D";

export function Navbar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { items, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");

  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "store_config"), [firestore]);
  const { data: storeSettings } = useDoc<StoreSettings>(settingsRef);

  const deliveryFee = storeSettings?.deliveryFee ?? 150;
  const grandTotal = totalPrice > 0 ? totalPrice + deliveryFee : 0;

  const adminRoleRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'admin_roles', user.uid);
  }, [firestore, user]);
  
  const { data: adminRole } = useDoc(adminRoleRef);
  const isAdmin = !!adminRole || user?.uid === "Q3AAJKZAPvZYvcTEkLatjWP1ftD2";

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: profile } = useDoc<UserProfile>(userProfileRef);

  const handleCheckout = async () => {
    if (!user && !guestPhone) {
      toast({ 
        variant: "destructive",
        title: "Phone Required", 
        description: "Please provide a contact number for delivery coordination." 
      });
      return;
    }

    if (items.length === 0) return;

    setIsCheckoutLoading(true);

    const now = new Date();
    const deliveryMinutes = 25;
    const expectedTime = new Date(now.getTime() + deliveryMinutes * 60000);

    const orderData: Omit<Order, 'id'> = {
      userId: user?.uid || "guest",
      customerName: user 
        ? (profile ? `${profile.firstName} ${profile.lastName}` : (user.email?.split('@')[0] || "Night Owl"))
        : "Guest Owl",
      customerPhone: user ? (profile?.phoneNumber || "") : guestPhone,
      totalAmount: grandTotal,
      status: 'pending',
      orderDate: now.toISOString(),
      expectedDeliveryTime: expectedTime.toISOString(),
      paymentStatus: 'unpaid',
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };

    const ordersCol = collection(firestore, "orders");
    
    try {
      const docRefPromise = addDocumentNonBlocking(ordersCol, orderData);
      
      if (user) {
        const earnedPoints = Math.floor(totalPrice / 1000) * 10;
        if (earnedPoints > 0) {
          const userRef = doc(firestore, "users", user.uid);
          updateDocumentNonBlocking(userRef, { loyaltyPoints: increment(earnedPoints) });
        }
      }

      setTimeout(async () => {
        const docRef = await docRefPromise;
        clearCart();
        setIsCheckoutLoading(false);
        setIsSheetOpen(false);
        setGuestPhone("");
        
        toast({ title: "Order Successful!" });

        if (docRef) {
          router.push(`/orders/tracking/${docRef.id}`);
        }
      }, 1000);
    } catch (e) {
      setIsCheckoutLoading(false);
      toast({ variant: "destructive", title: "Order Failed" });
    }
  };

  return (
    <nav className="fixed top-0 z-[60] w-full glass-morphism border-b h-16 shadow-lg">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Access site sections like items, combos, and rewards.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-10 mt-12">
                {isAdmin && (
                  <Link href="/admin" className="text-3xl font-headline text-accent flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8" /> DASHBOARD
                  </Link>
                )}
                <Link href="/products" className="text-4xl font-headline">ITEMS</Link>
                <Link href="/pairings" className="text-4xl font-headline">COMBOS</Link>
                <Link href="/loyalty" className="text-4xl font-headline">REWARDS</Link>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 relative rounded-full overflow-hidden flex items-center justify-center border border-white/10 bg-background">
              <Image src={storeSettings?.logoUrl || DEFAULT_LOGO} alt="Logo" fill className="object-cover" />
            </div>
            <span className="text-2xl font-headline tracking-widest uppercase pt-1">
              {storeSettings?.storeName || "RAKSHIMANDU"}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-8">
          <div className="hidden md:flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin" className="bg-accent text-accent-foreground px-6 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                DASHBOARD
              </Link>
            )}
            <Link href="/products" className="text-[10px] font-bold tracking-[0.2em] px-5 uppercase">ITEMS</Link>
            <Link href="/pairings" className="text-[10px] font-bold tracking-[0.2em] px-5 uppercase">COMBOS</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/account">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative w-10 h-10 rounded-full"
                  onClick={() => setIsSheetOpen(true)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background flex flex-col p-6 h-full overflow-hidden">
                <SheetHeader className="mb-8">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-4xl font-headline text-accent uppercase">CART</SheetTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <SheetDescription className="sr-only">Review your selected items and proceed to checkout.</SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                      <ShoppingBag className="w-16 h-16 mb-4" />
                      <p className="font-headline text-2xl">EMPTY CELLAR</p>
                    </div>
                  ) : (
                    <>
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 bg-card border border-white/5 rounded-2xl">
                          <div className="w-20 h-20 relative rounded-xl overflow-hidden shrink-0 border border-white/5">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <h4 className="font-headline text-lg uppercase truncate">{item.name}</h4>
                              <button onClick={() => removeFromCart(item.id)}><Trash2 className="w-4 h-4 text-muted-foreground" /></button>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3 bg-background rounded-full px-3 py-1">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-3 h-3" /></button>
                                <span className="text-xs font-bold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-3 h-3" /></button>
                              </div>
                              <span className="font-bold text-sm">NRS {item.price * item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {!user && (
                        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl space-y-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Loyalty Disclaimer</p>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">
                                You are not logged in. Priority points won't increase and rewards won't be earned for this order. 
                                <Link href="/account" className="text-accent font-black underline ml-1">LOGIN FOR REWARDS</Link>
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 ml-1">Guest Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input 
                                type="tel"
                                placeholder="+977 98XXXXXXXX"
                                value={guestPhone}
                                onChange={(e) => setGuestPhone(e.target.value)}
                                className="pl-10 h-12 bg-background border-white/5 rounded-xl text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                  <div className="space-y-2 border-b border-white/5 pb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Subtotal</span>
                      <span className="text-sm font-bold">NRS {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Delivery Fee</span>
                      <span className="text-sm font-bold">NRS {deliveryFee.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold opacity-40 uppercase">Total</span>
                    <span className="text-4xl font-headline text-accent">NRS {grandTotal.toLocaleString()}</span>
                  </div>
                  <Button 
                    onClick={handleCheckout} 
                    disabled={items.length === 0 || isCheckoutLoading || (!user && !guestPhone)} 
                    className="w-full h-14 bg-accent text-accent-foreground font-bold rounded-2xl"
                  >
                    {isCheckoutLoading ? <Loader2 className="animate-spin" /> : (user ? "CHECKOUT" : "CHECKOUT AS GUEST")}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
