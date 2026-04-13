
"use client";

import Link from "next/link";
import Image from "next/image";
import { Moon, Phone, Clock, Instagram, Facebook } from "lucide-react";
import { useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { StoreSettings } from "@/lib/types";

export function Footer() {
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "store_config"), [firestore]);
  const { data: storeSettings } = useDoc<StoreSettings>(settingsRef);

  return (
    <footer className="bg-white text-black py-16 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 relative rounded-full overflow-hidden flex items-center justify-center bg-black">
                {storeSettings?.logoUrl ? (
                  <Image src={storeSettings.logoUrl} alt="Logo" fill className="object-cover" />
                ) : (
                  <Moon className="w-6 h-6 text-white" />
                )}
              </div>
              <span className="text-2xl font-headline tracking-widest uppercase">
                {storeSettings?.storeName || "RAKSHIMANDU"}
              </span>
            </Link>
            <p className="text-sm opacity-70 leading-relaxed font-light">
              Premium drinks and pairings delivered rapid across the valley.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline text-lg uppercase">HELP</h4>
            <ul className="space-y-2 text-xs font-bold uppercase opacity-50">
              <li><Link href="/support">Support</Link></li>
              <li><Link href="/faqs">FAQs</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-headline text-lg uppercase">NAVIGATE</h4>
            <ul className="space-y-2 text-xs font-bold uppercase opacity-50">
              <li><Link href="/products">Items</Link></li>
              <li><Link href="/pairings">Combos</Link></li>
              <li><Link href="/loyalty">Rewards</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-headline text-lg uppercase">CONTACT</h4>
            <div className="space-y-4">
              <a href={`tel:${storeSettings?.contactNumber}`} className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-bold">{storeSettings?.contactNumber || "+977 9709047230"}</span>
              </a>
              <div className="flex gap-4">
                {storeSettings?.instagramUrl && <a href={storeSettings.instagramUrl}><Instagram className="w-5 h-5" /></a>}
                {storeSettings?.facebookUrl && <a href={storeSettings.facebookUrl}><Facebook className="w-5 h-5" /></a>}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-black/5 text-[10px] font-bold uppercase opacity-30 text-center">
          © {new Date().getFullYear()} {storeSettings?.storeName || "RAKSHIMANDU"}.
        </div>
      </div>
    </footer>
  );
}
