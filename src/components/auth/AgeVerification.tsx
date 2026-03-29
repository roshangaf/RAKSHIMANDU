"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AgeVerification() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem("age-verified");
    if (!verified) {
      setIsOpen(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem("age-verified", "true");
    setIsOpen(false);
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px] border-accent/20">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline text-center">AGE VERIFICATION</DialogTitle>
          <DialogDescription className="text-center py-4">
            Nightcap Nosh requires all users to be of legal drinking age in their jurisdiction. 
            Are you at least 18 years of age?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleExit} className="w-full sm:w-1/2">NO, EXIT</Button>
          <Button onClick={handleVerify} className="w-full sm:w-1/2 bg-accent text-accent-foreground hover:bg-accent/90">YES, I AM 18+</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
