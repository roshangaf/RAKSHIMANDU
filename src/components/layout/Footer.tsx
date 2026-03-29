
"use client";

import Link from "next/link";
import Image from "next/image";
import { Moon, Phone, Clock, Mail, Instagram, Facebook } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { StoreSettings } from "@/lib/types";

export function Footer() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "store_config"), [firestore]);
  const { data: storeSettings } = useDoc<StoreSettings>(settingsRef);

  const placeholderDelivery = PlaceHolderImages.find(img => img.id === 'hero-delivery');
  const deliveryImageUrl = storeSettings?.deliveryImageUrl || placeholderDelivery?.imageUrl;

  const whatsappLink = storeSettings?.whatsappNumber 
    ? `https://wa.me/${storeSettings.whatsappNumber.replace(/\D/g, '')}`
    : "https://wa.me/9779709047230";

  return (
    <footer className="bg-white text-black py-12 md:py-16 border-t border-black/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand and Info */}
          <div className="space-y-6 text-center sm:text-left flex flex-col items-center sm:items-start">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 relative rounded-lg overflow-hidden flex items-center justify-center">
                {storeSettings?.logoUrl ? (
                  <Image 
                    src={storeSettings.logoUrl} 
                    alt="Logo" 
                    fill 
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <Moon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <span className="text-xl md:text-2xl font-headline tracking-wider uppercase">
                {storeSettings?.storeName || "RAKSHIMANDU"}
              </span>
            </Link>
            <p className="text-[13px] opacity-70 leading-relaxed font-light max-w-xs">
              Curated premium pairings delivered within 30 minutes across Kathmandu, Lalitpur, and Bhaktapur.
            </p>
            <div className="flex gap-4 pt-2">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity p-2 bg-black/5 rounded-full">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              {storeSettings?.instagramUrl && (
                <a href={storeSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity p-2 bg-black/5 rounded-full">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {storeSettings?.facebookUrl && (
                <a href={storeSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity p-2 bg-black/5 rounded-full">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4 text-center sm:text-left">
            <h4 className="font-headline text-lg tracking-widest uppercase">HELP</h4>
            <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
              <li><Link href="/support" className="hover:text-primary transition-colors">Support</Link></li>
              <li><Link href="/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/delivery" className="hover:text-primary transition-colors">Zones</Link></li>
            </ul>
          </div>

          {/* Navigate */}
          <div className="space-y-4 text-center sm:text-left">
            <h4 className="font-headline text-lg tracking-widest uppercase">NAVIGATE</h4>
            <ul className="space-y-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
              <li><Link href="/products" className="hover:text-primary transition-colors">Items</Link></li>
              <li><Link href="/pairings" className="hover:text-primary transition-colors">Combos</Link></li>
              <li><Link href="/loyalty" className="hover:text-primary transition-colors">Rewards</Link></li>
              <li><Link href="/account" className="hover:text-primary transition-colors">Profile</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6 text-center sm:text-left flex flex-col items-center sm:items-start">
            <h4 className="font-headline text-lg tracking-widest uppercase">CONTACT</h4>
            <div className="space-y-4 w-full">
              <a href={`tel:${storeSettings?.contactNumber || '+9779709047230'}`} className="flex items-center justify-center sm:justify-start gap-3 group/phone">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover/phone:bg-black group-hover/phone:text-white transition-all">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">Call</p>
                  <p className="text-sm font-bold">{storeSettings?.contactNumber || "+977 9709047230"}</p>
                </div>
              </a>
              
              <Dialog>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-center sm:justify-start gap-3 cursor-pointer group/availability">
                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover/availability:bg-black group-hover/availability:text-white transition-all">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">Status</p>
                      <p className="text-sm font-bold">24/7 Delivery</p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] md:max-w-[70vw] p-0 overflow-hidden border-none bg-black rounded-[2rem]">
                  <DialogHeader className="sr-only">
                    <DialogTitle>24/7 Availability</DialogTitle>
                    <DialogDescription>Delivery status information.</DialogDescription>
                  </DialogHeader>
                  <div className="relative aspect-video w-full flex items-center justify-center text-center p-6 md:p-8">
                    {deliveryImageUrl && (
                      <Image 
                        src={deliveryImageUrl} 
                        alt="24/7 Delivery" 
                        fill 
                        className="object-cover opacity-40"
                        data-ai-hint="night city"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                    <div className="relative z-10 space-y-4 md:space-y-6">
                      <h2 className="text-4xl md:text-8xl font-headline text-white tracking-tighter leading-none drop-shadow-2xl">
                        WE SERVE 24/7,<br />
                        <span className="text-accent">GET IT NOW.</span>
                      </h2>
                      <div className="pt-4">
                         <a href={`tel:${storeSettings?.contactNumber || '+9779709047230'}`} className="inline-block bg-white text-black px-10 py-3.5 rounded-full text-lg md:text-xl font-headline tracking-widest hover:bg-accent transition-all shadow-xl">
                            CALL US
                         </a>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 text-center">
          <p>© {new Date().getFullYear()} {storeSettings?.storeName?.toUpperCase() || "RAKSHIMANDU"}.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
            <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
