"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Info, Clock, Truck } from "lucide-react";

export default function ZonesPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <header className="mb-16 space-y-4 text-center md:text-left">
          <div className="flex items-center gap-3 text-accent justify-center md:justify-start">
            <MapPin className="w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-[0.4em]">Delivery Network</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline tracking-tighter uppercase leading-none">
            OUR SERVICE <span className="text-accent">ZONES</span>
          </h1>
          <p className="text-muted-foreground text-xl font-light leading-relaxed max-w-2xl">
            We deliver premium pairings across the entire Kathmandu Valley, 24/7.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Map Container */}
          <div className="lg:col-span-2 relative">
            <div className="p-1 bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
              <div className="relative aspect-square md:aspect-video w-full rounded-[2.3rem] overflow-hidden bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d113032.29061541565!2d85.3206!3d27.70076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2snp!4v1710000000000!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(1) invert(1) contrast(1.2) opacity(0.8)' }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="hover:opacity-100 transition-opacity duration-700"
                ></iframe>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <Badge variant="outline" className="bg-primary/20 border-primary/30 px-6 py-2 text-xs font-bold tracking-widest text-white">KATHMANDU</Badge>
              <Badge variant="outline" className="bg-primary/20 border-primary/30 px-6 py-2 text-xs font-bold tracking-widest text-white">LALITPUR</Badge>
              <Badge variant="outline" className="bg-primary/20 border-primary/30 px-6 py-2 text-xs font-bold tracking-widest text-white">BHAKTAPUR</Badge>
            </div>
          </div>

          {/* Info Side */}
          <div className="space-y-8">
            <div className="bg-card/50 border border-white/5 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <Truck className="w-6 h-6" />
                <h3 className="font-headline text-2xl uppercase">Rapid Delivery</h3>
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Our couriers are strategically stationed throughout the valley to ensure an average delivery time of <span className="text-white font-bold">24-30 minutes</span>.
              </p>
            </div>

            <div className="bg-card/50 border border-white/5 p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 text-accent">
                <Clock className="w-6 h-6" />
                <h3 className="font-headline text-2xl uppercase">24/7 Availability</h3>
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Rain or shine, day or night, we are always active. Every corner of the three cities is covered at any hour.
              </p>
            </div>

            <div className="p-8 bg-accent/5 border border-accent/10 rounded-3xl flex items-start gap-4">
              <Info className="w-5 h-5 text-accent mt-1 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                Note: Some restricted areas or deep inner alleys might require a meeting point with the courier for faster fulfillment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
