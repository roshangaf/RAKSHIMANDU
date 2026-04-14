
"use client";

import { Navbar } from "@/components/layout/Navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Clock, ShieldCheck, Zap, Star } from "lucide-react";

const FAQ_DATA = [
  {
    category: "Delivery & Service",
    icon: Clock,
    questions: [
      {
        q: "Do you really deliver 24/7?",
        a: "Yes! Cravings don't sleep, and neither do we. Our couriers are stationed throughout Kathmandu, Lalitpur, and Bhaktapur every hour of the night to ensure your orders arrive when you need them most."
      },
      {
        q: "What is the average delivery time?",
        a: "Our average delivery time is under 30 minutes. Depending on your exact location in the valley, 'Sher Bahadur' and our other buddies usually arrive within 20-25 minutes."
      },
      {
        q: "Where do you deliver?",
        a: "We currently cover the entire Kathmandu Valley, including all major areas of Kathmandu, Lalitpur, and Bhaktapur."
      }
    ]
  },
  {
    category: "Age & Safety",
    icon: ShieldCheck,
    questions: [
      {
        q: "Is age verification mandatory?",
        a: "Absolutely. To comply with local regulations, we require all users to be 18+ for any orders containing alcohol. Our delivery buddies will check your physical ID upon arrival."
      },
      {
        q: "Can I order just snacks?",
        a: "Of course! While we specialize in pairings, you are welcome to order any individual items from our snack or beverage catalog."
      }
    ]
  },
  {
    category: "Club घ्याम्पे (Loyalty)",
    icon: Star,
    questions: [
      {
        q: "How do I earn loyalty points?",
        a: "For every 1,000 NRS spent, you earn 10 points. These are automatically added to your profile as soon as your order is placed while you are logged in."
      },
      {
        q: "What are the benefits of Silver status?",
        a: "Reaching Silver status (5,000 points) unlocks unlimited free rapid delivery, priority fulfillment during peak hours, and exclusive access to our limited-edition vintage spirit collection."
      }
    ]
  }
];

export default function FAQsPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <header className="mb-16 space-y-4 text-center md:text-left">
          <div className="flex items-center gap-3 text-accent justify-center md:justify-start">
            <HelpCircle className="w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-[0.4em]">Knowledge Base</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-headline tracking-tighter uppercase">
            FREQUENTLY ASKED <span className="text-accent">QUESTIONS</span>
          </h1>
          <p className="text-muted-foreground text-xl font-light leading-relaxed max-w-2xl">
            Everything you need to know about navigating the night with RAKSHIMANDU.
          </p>
        </header>

        <div className="space-y-12">
          {FAQ_DATA.map((section, idx) => (
            <section key={idx} className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <section.icon className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-headline tracking-widest uppercase">{section.category}</h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-4">
                {section.questions.map((faq, fIdx) => (
                  <AccordionItem 
                    key={fIdx} 
                    value={`item-${idx}-${fIdx}`}
                    className="bg-card/50 border border-white/5 rounded-2xl px-6 overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline py-6">
                      <span className="text-left font-bold text-lg tracking-tight hover:text-accent transition-colors">
                        {faq.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground font-light text-base leading-relaxed pb-6">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>

        <div className="mt-20 p-12 bg-primary/20 rounded-[2rem] border border-white/10 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] -mr-32 -mt-32" />
          <h3 className="text-4xl font-headline uppercase">Still need help?</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our night sommelier and support team are available 24/7 via live chat or phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={() => window.location.href = '/support'}
              className="bg-white text-black px-10 h-14 rounded-full font-headline tracking-widest text-lg hover:bg-accent transition-all"
            >
              OPEN LIVE CHAT
            </button>
            <a 
              href="tel:+9779709047230"
              className="bg-transparent border-2 border-white/10 text-white px-10 h-14 rounded-full font-headline tracking-widest text-lg flex items-center justify-center hover:bg-white/5 transition-all"
            >
              CALL SUPPORT
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
