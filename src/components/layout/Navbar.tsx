
"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, User, Menu, Moon, ShoppingBag, ShieldCheck, Trash2, Plus, Minus, Loader2, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function Navbar() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { items, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const ordersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "orders"),
      where("userId", "==", user.uid)
    );
  }, [user, firestore]);

  const { data: recentOrders } = useCollection<Order>(ordersQuery);

  const displayOrders = useMemo(() => {
    if (!recentOrders) return [];
    return [...recentOrders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 3);
  }, [recentOrders]);

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to complete your order.",
      });
      router.push('/account');
      return;
    }

    if (items.length === 0) return;

    setIsCheckoutLoading(true);

    const now = new Date();
    const deliveryMinutes = 25 + Math.floor(Math.random() * 10);
    const expectedTime = new Date(now.getTime() + deliveryMinutes * 60000);

    const orderData: Omit<Order, 'id'> = {
      userId: user.uid,
      customerName: profile ? `${profile.firstName} ${profile.lastName}` : (user.displayName || user.email?.split('@')[0] || "Night Owl"),
      customerPhone: profile?.phoneNumber || "",
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
      
      const earnedPoints = Math.floor(totalPrice / 1000) * 10;
      if (earnedPoints > 0) {
        const userRef = doc(firestore, "users", user.uid);
        updateDocumentNonBlocking(userRef, {
          loyaltyPoints: increment(earnedPoints)
        });
      }

      setTimeout(async () => {
        const docRef = await docRefPromise;
        clearCart();
        setIsCheckoutLoading(false);
        setIsSheetOpen(false);
        
        toast({
          title: "Order Successful!",
          description: `Drinks away! Total with delivery: NRS ${grandTotal.toLocaleString()}`,
        });

        if (docRef) {
          router.push(`/orders/tracking/${docRef.id}`);
        }
      }, 1000);
    } catch (e) {
      setIsCheckoutLoading(false);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "Something went wrong.",
      });
    }
  };

  return (
    <nav className="fixed top-0 z-[60] w-full glass-morphism border-b h-16 shadow-lg">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/5">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background w-[85vw] max-w-sm border-r-white/5">
              <SheetHeader className="mb-12 text-left pt-6">
                <SheetTitle className="text-5xl font-headline tracking-widest uppercase text-accent">THE NIGHT</SheetTitle>
                <SheetDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">
                  Navigate the premium valley
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-10">
                {isAdmin && (
                  <Link href="/admin" className="text-3xl font-headline text-accent flex items-center gap-3 hover:translate-x-2 transition-transform">
                    <ShieldCheck className="w-8 h-8" /> DASHBOARD
                  </Link>
                )}
                <Link href="/products" className="text-4xl font-headline hover:text-accent hover:translate-x-2 transition-transform">ITEMS</Link>
                <Link href="/pairings" className="text-4xl font-headline hover:text-accent hover:translate-x-2 transition-transform">COMBOS</Link>
                <Link href="/loyalty" className="text-4xl font-headline hover:text-accent hover:translate-x-2 transition-transform">REWARDS</Link>
                <Link href="/faqs" className="text-4xl font-headline hover:text-accent hover:translate-x-2 transition-transform">FAQS</Link>
                <Link href="/support" className="text-4xl font-headline hover:text-accent hover:translate-x-2 transition-transform">SUPPORT</Link>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link href="/" className="flex items-center gap-2 md:gap-4 group">
            <div className="w-8 h-8 md:w-10 md:h-10 relative rounded-full overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-accent/50 transition-colors bg-background">
              {storeSettings?.logoUrl ? (
                <Image src={storeSettings.logoUrl} alt="Logo" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center group-hover:bg-accent transition-colors duration-500">
                  <Moon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              )}
            </div>
            <span className="text-2xl md:text-3xl font-headline tracking-widest uppercase leading-none pt-1 transition-colors group-hover:text-accent">
              {storeSettings?.storeName || "RAKSHIMANDU"}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-8">
          <div className="hidden md:flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin" className="bg-accent text-accent-foreground px-6 py-2.5 rounded-full text-[10px] font-bold tracking-[0.2em] hover:bg-white transition-all uppercase flex items-center gap-2 mr-4 shadow-lg active:scale-95">
                <ShieldCheck className="w-4 h-4" /> DASHBOARD
              </Link>
            )}
            <Link href="/products" className="text-[10px] font-bold tracking-[0.2em] px-5 hover:text-accent transition-colors uppercase">ITEMS</Link>
            <Link href="/pairings" className="text-[10px] font-bold tracking-[0.2em] px-5 hover:text-accent transition-colors uppercase">COMBOS</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/account">
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full hover:bg-white/5 hover:text-accent transition-all">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative w-10 h-10 rounded-full hover:bg-white/5 hover:text-accent transition-all"
                  onClick={() => setIsSheetOpen(!isSheetOpen)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground text-[10px] font-bold border-2 border-background animate-in zoom-in-50 duration-300">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background w-[95vw] sm:max-w-md flex flex-col p-6 md:p-8 border-l-white/5 h-full overflow-hidden">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsSheetOpen(false)}
                    className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 flex items-center gap-2 px-0"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsSheetOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <SheetHeader className="mb-6 text-left shrink-0">
                  <SheetTitle className="text-5xl md:text-6xl font-headline tracking-tighter uppercase text-accent leading-none">YOUR SELECTION</SheetTitle>
                  <SheetDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                    Premium spirits & pairings in transit
                  </SheetDescription>
                </SheetHeader>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-hide pb-6 touch-pan-y">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center opacity-20">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-40">The cellar awaits your choice</p>
                        <Button 
                          onClick={() => setIsSheetOpen(false)}
                          variant="outline" 
                          className="rounded-full border-white/10 font-bold uppercase tracking-widest text-[10px]"
                        >
                          START SHOPPING
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                         <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Review Items</p>
                         <Button variant="link" onClick={() => setIsSheetOpen(false)} className="text-[10px] font-bold text-accent uppercase tracking-widest p-0 h-auto">Continue Shopping</Button>
                      </div>
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 bg-card border border-white/5 rounded-2xl shadow-xl animate-in slide-in-from-right-10 duration-300">
                          <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-white/5">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="font-headline text-xl tracking-wide uppercase leading-tight line-clamp-1">{item.name}</h4>
                              <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-red-500 p-1 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="flex items-center gap-4 bg-background rounded-full px-4 py-1.5 border border-white/10 shadow-inner">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-accent transition-colors">
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-accent transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="font-bold text-sm text-accent">NRS {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {displayOrders.length > 0 && (
                    <div className="pt-10 space-y-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Mission History</p>
                      {displayOrders.map((order) => (
                        <div key={order.id} className="p-5 bg-card/40 border border-white/5 rounded-2xl flex justify-between items-center opacity-80 backdrop-blur-sm group hover:opacity-100 transition-all">
                          <div className="flex-1 min-w-0 mr-4">
                            <h4 className="font-bold text-sm tracking-tight group-hover:text-accent transition-colors truncate">#{order.id.slice(-8).toUpperCase()}</h4>
                            <div className="flex items-center gap-2 mt-1.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                               <p className="text-[10px] uppercase font-bold opacity-60 tracking-widest">{order.status.replace(/-/g, ' ')}</p>
                            </div>
                          </div>
                          <Link href={`/orders/tracking/${order.id}`} onClick={() => setIsSheetOpen(false)}>
                            <Button variant="outline" className="text-[10px] font-bold h-10 px-6 rounded-full uppercase border-white/10 hover:bg-accent hover:text-accent-foreground shadow-lg transition-all">Track</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-8 border-t border-white/10 space-y-4 bg-background shrink-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">Items Subtotal</span>
                      <span className="font-bold text-sm">NRS {totalPrice.toLocaleString()}</span>
                    </div>
                    {totalPrice > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">Delivery Fee</span>
                        <span className="font-bold text-sm">NRS {deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-end pt-2">
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] pb-1">Grand Total</span>
                      <span className="text-4xl md:text-5xl font-headline tracking-tighter text-accent leading-none">NRS {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCheckout}
                    disabled={items.length === 0 || isCheckoutLoading}
                    className="w-full h-16 bg-accent text-accent-foreground font-bold rounded-2xl shadow-3xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
                  >
                    {isCheckoutLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "Initiate Fulfillment"}
                  </Button>
                  <div className="flex items-center justify-center gap-2 pb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Rapid valley delivery active</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
