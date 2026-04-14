
"use client";

import Link from "next/link";
import Image from "next/image";
import { Moon, Phone, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";
import { useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { StoreSettings } from "@/lib/types";

export function Footer() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "store_config"), [firestore]);
  const { data: storeSettings } = useDoc<StoreSettings>(settingsRef);

  return (
    <footer className="bg-white text-black py-16 border-t mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-12 h-12 relative rounded-full overflow-hidden flex items-center justify-center bg-black border border-black/5">
                {storeSettings?.logoUrl ? (
                  <Image src={storeSettings.logoUrl} alt="Logo" fill className="object-cover" />
                ) : (
                  <Moon className="w-6 h-6 text-white" />
                )}
              </div>
              <span className="text-2xl font-headline tracking-widest uppercase pt-1">
                {storeSettings?.storeName || "RAKSHIMANDU"}
              </span>
            </Link>
            <p className="text-sm opacity-70 leading-relaxed font-light">
              Premium drinks and pairings delivered rapid across the valley. Always awake. Always here.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline text-lg uppercase">HELP</h4>
            <ul className="space-y-2 text-xs font-bold uppercase opacity-50">
              <li><Link href="/support" className="hover:text-primary transition-colors">Support</Link></li>
              <li><Link href="/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline text-lg uppercase">NAVIGATE</h4>
            <ul className="space-y-2 text-xs font-bold uppercase opacity-50">
              <li><Link href="/products" className="hover:text-primary transition-colors">items</Link></li>
              <li><Link href="/pairings" className="hover:text-primary transition-colors">Combos</Link></li>
              <li><Link href="/loyalty" className="hover:text-primary transition-colors">Rewards</Link></li>
              <li><Link href="/account" className="hover:text-primary transition-colors">Account</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-headline text-lg uppercase">CONTACT</h4>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <a href={`tel:${storeSettings?.contactNumber || "+9779709047230"}`} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold">{storeSettings?.contactNumber || "+977 9709047230"}</span>
                </a>
                <p className="text-[10px] font-bold uppercase opacity-40 ml-11">24/7 Hotline</p>
              </div>
              
              <div className="flex gap-4 items-center">
                {storeSettings?.instagramUrl && (
                  <a href={storeSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-primary transition-all hover:scale-110">
                    <Instagram className="w-5 h-5 text-white" />
                  </a>
                )}
                {storeSettings?.facebookUrl && (
                  <a href={storeSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-primary transition-all hover:scale-110">
                    <Facebook className="w-5 h-5 text-white" />
                  </a>
                )}
                {storeSettings?.whatsappNumber && (
                  <a href={`https://wa.me/${storeSettings.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-primary transition-all hover:scale-110">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold uppercase opacity-30">
            © {new Date().getFullYear()} {storeSettings?.storeName || "RAKSHIMANDU"}. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-[10px] font-bold uppercase opacity-30 cursor-pointer hover:opacity-100 transition-opacity">Privacy Policy</span>
            <span className="text-[10px] font-bold uppercase opacity-30 cursor-pointer hover:opacity-100 transition-opacity">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
