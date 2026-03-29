
"use client";

import * as React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Package, Truck, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { useDoc, useMemoFirebase, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Order } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface OrderTrackingPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderTrackingPage({ params }: OrderTrackingPageProps) {
  const { id } = React.use(params);
  const firestore = useFirestore();
  const router = useRouter();

  const orderRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, "orders", id);
  }, [firestore, id]);

  const { data: order, isLoading } = useDoc<Order>(orderRef);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center space-y-6">
          <h1 className="text-6xl font-headline">ORDER NOT FOUND</h1>
          <p className="text-muted-foreground">We couldn't track this order. It might have been misplaced in the night.</p>
          <Button onClick={() => router.push('/')} variant="outline" className="rounded-full">RETURN HOME</Button>
        </div>
      </main>
    );
  }

  const steps = [
    { label: "Order Received", status: "complete", icon: Package, time: new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    { label: "Preparing Items", status: order.status === 'pending' ? 'active' : 'complete', icon: CheckCircle2, time: "Working..." },
    { label: "Out for Delivery", status: order.status === 'out-for-delivery' ? 'active' : (order.status === 'completed' ? 'complete' : 'pending'), icon: Truck, time: order.expectedDeliveryTime ? new Date(order.expectedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--" },
    { label: "Delivered", status: order.status === 'completed' ? 'complete' : 'pending', icon: MapPin, time: "Arriving" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-card rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 bg-gradient-to-r from-primary/30 to-accent/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Track Order</p>
              <h1 className="text-3xl font-headline">#{order.id.slice(-8).toUpperCase()}</h1>
            </div>
            <Badge className={`px-3 py-1 border-white/10 ${
              order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400 animate-pulse'
            }`}>
              {order.status.replace(/-/g, ' ').toUpperCase()}
            </Badge>
          </div>
          
          <div className="p-8 space-y-8">
            {/* Map Placeholder */}
            <div className="aspect-video w-full bg-muted rounded-xl relative overflow-hidden flex items-center justify-center border border-white/5">
              <div className="absolute inset-0 opacity-20 grayscale bg-[url('https://picsum.photos/seed/map/800/600')]" />
              <div className="relative z-10 flex flex-col items-center">
                <Truck className="w-12 h-12 text-accent animate-bounce mb-2" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  {order.status === 'completed' ? 'Arrived!' : 'Shereeee is on the move'}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {steps.map((step, idx) => (
                <div key={step.label} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.status === 'complete' ? 'bg-primary border-primary text-white' : 
                      step.status === 'active' ? 'bg-accent border-accent text-accent-foreground scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 
                      'bg-card border-white/10 text-muted-foreground'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    {idx < steps.length - 1 && (
                      <div className={`w-0.5 h-10 ${step.status === 'complete' ? 'bg-primary' : 'bg-white/10'}`} />
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold uppercase tracking-tight ${step.status === 'pending' ? 'text-muted-foreground' : ''}`}>{step.label}</h3>
                      <span className="text-xs text-muted-foreground font-mono">{step.time}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest opacity-60">
                      {step.status === 'active' ? "Your order is being handled with care." : ""}
                      {step.status === 'complete' && idx === 0 ? "Confirmed & Paid" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="bg-white/5" />
            
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border border-white/10">
                  <img src="https://picsum.photos/seed/shere/100/100" alt="Driver" className="object-cover" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Your Courier</p>
                  <p className="font-headline text-lg">SHEREEEE</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Total</p>
                <p className="font-headline text-lg text-accent">NRS {order.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <Button onClick={() => router.push('/')} variant="ghost" className="w-full text-xs font-bold tracking-[0.2em] opacity-40 hover:opacity-100">
              <ArrowLeft className="w-3 h-3 mr-2" /> RETURN TO HOME
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
