
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Star, Trophy, Gift, Zap, ShieldCheck, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { UserProfile, StoreSettings } from "@/lib/types";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function LoyaltyPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const { data: storeSettings } = useDoc<StoreSettings>(useMemoFirebase(() => doc(firestore, "settings", "store_config"), [firestore]));

  const points = profile?.loyaltyPoints || 0;
  const progressToSilver = Math.min((points / 5000) * 100, 100);
  const clubName = storeSettings?.clubName || "CLUB घ्याम्पे";
  const clubDescription = storeSettings?.clubDescription || "The elite society of late-night enthusiasts. Earn points on every sip, unlock vintage spirits, and get priority delivery.";
  
  const placeholderClubImg = PlaceHolderImages.find(img => img.id === 'club-hero');
  const clubImageUrl = storeSettings?.clubImageUrl || placeholderClubImg?.imageUrl;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          <header className="relative text-center space-y-6 py-24 px-4 overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl mb-12">
            {clubImageUrl && (
              <div className="absolute inset-0 z-0">
                <Image 
                  src={clubImageUrl} 
                  alt="Club Background" 
                  fill 
                  className="object-cover opacity-50"
                  priority
                  data-ai-hint={placeholderClubImg?.imageHint || "luxury bar"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background" />
              </div>
            )}
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-primary/40 backdrop-blur-md border border-primary/30 rounded-full text-accent text-xs font-bold tracking-widest uppercase mb-4 shadow-lg">
                <Trophy className="w-3 h-3" /> Exclusive Access
              </div>
              <h1 className="text-6xl md:text-9xl font-headline tracking-tighter uppercase drop-shadow-2xl">
                {clubName}
              </h1>
              <p className="text-white text-xl font-light max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
                {clubDescription}
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-3xl border border-white/5 space-y-4 hover:border-accent/20 transition-all">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-headline">EARN 10X</h3>
              <p className="text-sm text-muted-foreground font-light">get 10 points on every 1000 spent on items</p>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-white/5 space-y-4 hover:border-accent/20 transition-all">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-headline">FREE DELIVERY</h3>
              <p className="text-sm text-muted-foreground font-light">Unlock unlimited free rapid delivery once you reach Silver status.</p>
            </div>
            <div className="bg-card p-8 rounded-3xl border border-white/5 space-y-4 hover:border-accent/20 transition-all">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-2xl font-headline">VINTAGE ACCESS</h3>
              <p className="text-sm text-muted-foreground font-light">Exclusive pre-order rights for limited edition single malts.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/30 to-accent/5 p-8 md:p-12 rounded-[2rem] border border-white/10">
            <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-4xl font-headline uppercase">JOIN THE {clubName}</h2>
                <p className="text-muted-foreground font-light max-w-md">Start your journey tonight. Register now and get 500 bonus points on your first order.</p>
                <Button 
                  onClick={() => router.push('/account')}
                  className="bg-accent text-accent-foreground font-bold px-12 h-14 rounded-full mt-4"
                >
                  {user ? "VIEW MY STATUS" : "BECOME A MEMBER"}
                </Button>
              </div>
              <div className="w-full md:w-80 bg-background/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-6">
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">Your Tier</p>
                  <p className="text-2xl font-headline text-accent">
                    {isProfileLoading ? "..." : (points >= 5000 ? "SILVER OWL" : "NIGHT OWL")}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                    <span>Progress to Silver</span>
                    <span>{points.toLocaleString()} / 5,000</span>
                  </div>
                  <Progress value={progressToSilver} className="h-2 bg-white/5" />
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-xs font-medium">
                    {isUserLoading || isProfileLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      `${points.toLocaleString()} Points available`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
