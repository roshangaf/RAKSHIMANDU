'use client';

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-10 relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-4xl">
          {/* Map Section */}
          <div className="p-1 bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden group shadow-2xl">
            <div className="relative aspect-video w-full rounded-[2.3rem] overflow-hidden bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d113032.29061541565!2d85.3206!3d27.70076!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2snp!4v1710000000000!5m2!1sen!2snp"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(1) invert(1) contrast(1.2) opacity(0.7)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="hover:opacity-90 transition-opacity duration-700"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent" />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-6">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-8 h-8 text-accent animate-bounce" />
                  <span className="text-xl font-headline tracking-[0.3em] uppercase drop-shadow-lg text-white">WE SERVE IN</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-accent/20 px-6 py-2 text-xs font-bold tracking-widest text-white">KATHMANDU</Badge>
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-accent/20 px-6 py-2 text-xs font-bold tracking-widest text-white">LALITPUR</Badge>
                  <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-accent/20 px-6 py-2 text-xs font-bold tracking-widest text-white">BHAKTAPUR</Badge>
                </div>
                <Link href="/" className="mt-4 text-[10px] font-bold uppercase tracking-[0.5em] text-accent hover:underline transition-all">
                  Return to the Night
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">
            24/7 VALLEY-WIDE DELIVERY DOMAIN
          </div>
        </div>
        
        {/* Subtle Decorative Grain */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://picsum.photos/seed/noise/1000/1000')] bg-repeat" />
      </div>
    </main>
  );
}