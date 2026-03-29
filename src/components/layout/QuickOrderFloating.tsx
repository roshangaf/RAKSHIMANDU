'use client';

import { useState, useRef, useEffect } from "react";
import { PhoneCall } from "lucide-react";

export function QuickOrderFloating() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialElementPos = useRef({ x: 0, y: 0 });
  const hasMovedSignificant = useRef(false);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const deltaX = clientX - dragStartPos.current.x;
      const deltaY = clientY - dragStartPos.current.y;

      // Threshold to distinguish between a click and a drag
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMovedSignificant.current = true;
      }

      setPosition({
        x: initialElementPos.current.x + deltaX,
        y: initialElementPos.current.y + deltaY,
      });
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  const onMouseDown = (e: React.MouseEvent) => {
    // Only drag on left click
    if (e.button !== 0) return;
    startDragging(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      startDragging(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const startDragging = (clientX: number, clientY: number) => {
    setIsDragging(true);
    hasMovedSignificant.current = false;
    dragStartPos.current = { x: clientX, y: clientY };
    initialElementPos.current = position;
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    // Prevent the call if we were dragging
    if (hasMovedSignificant.current) {
      e.preventDefault();
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 select-none touch-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? "grabbing" : "grab",
        transition: isDragging ? "none" : "transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <a 
        href="tel:+9779709047230" 
        onClick={handleLinkClick}
        className="flex items-center gap-4 bg-white text-black pl-5 pr-6 py-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-black hover:bg-black hover:text-white hover:border-white transition-all duration-300 group cursor-pointer active:scale-95"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping group-hover:bg-accent/40" />
          <div className="relative w-10 h-10 bg-black rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
            <PhoneCall className="w-5 h-5 text-white group-hover:text-black transition-colors" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100">Quick Order?</span>
          <span className="text-sm font-headline tracking-widest leading-none mt-1">CALL US NOW</span>
        </div>
      </a>
    </div>
  );
}
