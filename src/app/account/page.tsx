
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, LogIn, Loader2, UserPlus, Star, ShoppingBag, ShieldCheck, Phone } from "lucide-react";
import { useAuth, initiateEmailSignIn, initiateEmailSignUp, useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc } from "firebase/firestore";
import { UserProfile } from "@/lib/types";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

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
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (user && !isProfileLoading && !profile && isRegistering) {
      const newProfile: UserProfile = {
        id: user.uid,
        firebaseUid: user.uid,
        firstName: firstName || "Night",
        lastName: lastName || "Owl",
        email: user.email || "",
        phoneNumber: phoneNumber || "",
        dateOfBirth: "2000-01-01",
        ageVerified: true,
        loyaltyPoints: 500,
        isAdmin: isAdmin
      };
      const docRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(docRef, newProfile, { merge: true });
    }
  }, [user, profile, isProfileLoading, isRegistering, firestore, firstName, lastName, phoneNumber, isAdmin]);

  if (isUserLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </main>
    );
  }

  if (user) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 bg-accent/10 rounded-full flex items-center justify-center mb-4 border-2 border-accent/20">
              <User className="w-16 h-16 text-accent" />
            </div>
            {isAdmin && (
              <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground p-2 rounded-full shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-headline tracking-tighter">
              {profile?.firstName ? `HELLO, ${profile.firstName.toUpperCase()}` : "WELCOME BACK"}
            </h1>
            <div className="flex flex-col items-center gap-1">
              <p className="text-muted-foreground text-xl font-light">
                Logged in as <span className="text-white font-bold">{user.email}</span>
              </p>
              {profile?.phoneNumber && (
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> {profile.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            <div className="bg-card p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Loyalty Points</span>
              <span className="text-4xl font-headline">{profile?.loyaltyPoints ?? 0}</span>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-white/5 flex flex-col items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</span>
              <span className="text-4xl font-headline">{isAdmin ? "ADMIN" : "NIGHT OWL"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {isAdmin && (
              <Button onClick={() => router.push('/admin')} className="bg-accent text-accent-foreground font-bold px-8 h-12 rounded-full">
                ADMIN DASHBOARD
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push('/products')} className="border-white/10 font-bold px-8 h-12 rounded-full">
              BROWSE CATALOG
            </Button>
            <Button variant="ghost" onClick={() => auth.signOut()} className="text-red-400 font-bold px-8 h-12 rounded-full">
              SIGN OUT
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Non-admin users MUST provide a phone number during registration
    if (isRegistering && !phoneNumber && !isAdmin) {
      toast({ variant: "destructive", title: "Missing Information", description: "Phone number is mandatory for delivery coordination." });
      return;
    }
    
    setIsLoading(true);
    try {
      if (isRegistering) {
        initiateEmailSignUp(auth, email, password);
        toast({ title: "Welcome to the Night", description: "Creating your credentials..." });
      } else {
        initiateEmailSignIn(auth, email, password);
        toast({ title: "Entering the Cellar", description: "Verifying your credentials..." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Action Failed", description: error.message });
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="w-full max-w-md bg-card border border-white/5 p-8 rounded-[2rem] shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {isRegistering ? <UserPlus className="w-8 h-8 text-accent" /> : <User className="w-8 h-8 text-accent" />}
            </div>
            <h1 className="text-4xl font-headline">{isRegistering ? "NIGHT JOIN" : "NIGHT LOGIN"}</h1>
            <p className="text-muted-foreground text-sm font-light">
              {isRegistering ? "Create an account to track your orders." : "Enter the cellar to manage your orders."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-60">First Name</label>
                    <Input 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-background border-white/5 h-12 rounded-xl" 
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-60">Last Name</label>
                    <Input 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-background border-white/5 h-12 rounded-xl" 
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-60">Phone Number (Mandatory)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12 bg-background border-white/5 h-12 rounded-xl focus:ring-accent/50" 
                      placeholder="+977 98XXXXXXXX" 
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-60">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-background border-white/5 h-12 rounded-xl focus:ring-accent/50" 
                  placeholder="hello@nightowl.com" 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest ml-1 opacity-60">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 bg-background border-white/5 h-12 rounded-xl focus:ring-accent/50" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            <Button 
              disabled={isLoading}
              className="w-full h-14 bg-accent text-accent-foreground font-bold rounded-xl shadow-xl hover:scale-[1.02] transition-transform mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (
                isRegistering ? <>JOIN THE NIGHT <UserPlus className="ml-2 w-5 h-5" /></> : <>ENTER THE CELLAR <LogIn className="ml-2 w-5 h-5" /></>
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground font-light">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <span 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setPhoneNumber(""); // Reset phone when switching
                }}
                className="text-accent font-bold cursor-pointer hover:underline"
              >
                {isRegistering ? "Login Now" : "Register Now"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
