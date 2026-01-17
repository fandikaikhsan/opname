import React, { useState, useRef, useCallback, useMemo } from 'react';
import { StockItem } from '../types';
import { Plus, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StockCardProps {
  item: StockItem;
  onUpdate: (id: number, newQty: number) => void;
}

const StockCard: React.FC<StockCardProps> = ({ item, onUpdate }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef<number>(400); 
  const quantityRef = useRef(item.quantity);
  
  const [scale, setScale] = useState(1);

  // Sync ref
  React.useEffect(() => {
    quantityRef.current = item.quantity;
  }, [item.quantity]);

  // --- Gradient & Status Logic ---
  const status = useMemo(() => {
    if (item.quantity < item.minStock) return 'critical';
    if (item.quantity < item.minStock + 5) return 'warning'; // Smaller buffer for demo
    return 'good';
  }, [item.quantity, item.minStock]);

  const getGradient = () => {
    switch (status) {
      case 'critical': // Red/Pink
        return 'bg-gradient-to-br from-red-600 via-rose-600 to-orange-700';
      case 'warning': // Yellow/Orange
        return 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600';
      case 'good': // Green
        return 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700';
      default:
        return 'bg-gray-800';
    }
  };

  const increment = useCallback(() => {
    onUpdate(item.id, item.quantity + 1);
  }, [item.id, item.quantity, onUpdate]);

  const decrement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (item.quantity > 0) {
      onUpdate(item.id, item.quantity - 1);
    }
  };

  // --- Touch Logic ---
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressed(true);
    setScale(0.96);

    onUpdate(item.id, quantityRef.current + 1);
    speedRef.current = 400;
    
    if (intervalRef.current) clearTimeout(intervalRef.current);

    const run = () => {
      speedRef.current = Math.max(40, speedRef.current * 0.85);
      const nextVal = quantityRef.current + 1;
      onUpdate(item.id, nextVal);
      quantityRef.current = nextVal;
      intervalRef.current = setTimeout(run, speedRef.current);
    };

    timeoutRef.current = setTimeout(() => {
      run();
    }, 400); 
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsPressed(false);
    setScale(1);
    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (isPressed) {
      handlePointerUp(e);
    }
  };

  return (
    <div 
      id={`item-${item.id}`}
      className={`
        relative overflow-hidden rounded-3xl shadow-lg
        flex flex-col select-none touch-none aspect-[3/4.2]
        transition-all duration-200 ease-out
        ${getGradient()}
      `}
      style={{ transform: `scale(${scale})` }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-white opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      
      {/* Press Ripple Effect */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-150 pointer-events-none ${isPressed ? 'opacity-20' : 'opacity-0'}`} />

      {/* Top: Image Section (30%) - Reduced height for more content space */}
      <div className="h-[30%] w-full relative shrink-0 bg-black/20">
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* Subtle gradient at bottom of image to blend, but not cover */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Bottom: Content Section */}
      <div className="flex-1 p-3 flex flex-col justify-between relative z-10 text-white">
        
        {/* Header Info */}
        <div className="pointer-events-none mb-1">
           {/* Status Indicator Pill */}
           <div className="mb-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 w-fit shadow-sm">
              {status === 'critical' && <AlertCircle size={10} className="text-red-200" />}
              {status === 'good' && <CheckCircle2 size={10} className="text-emerald-200" />}
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                {status === 'critical' ? 'Stok Tipis' : status === 'warning' ? 'Pesan Lagi' : 'Aman'}
              </span>
           </div>

          <h3 className="font-bold text-base leading-tight line-clamp-2 drop-shadow-md min-h-[2.5rem]">
            {item.name}
          </h3>
          <p className="text-[10px] text-white/80 font-medium mt-1 uppercase tracking-wide opacity-90">
            Min: {item.minStock} {item.unit}
          </p>
        </div>

        {/* Counter Area - Optimized for visibility */}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col">
            {/* Reduced from text-5xl to text-4xl to prevent cutoff */}
            <span className="text-4xl font-black tracking-tighter drop-shadow-xl tabular-nums leading-none">
              {item.quantity}
            </span>
            <span className="text-xs font-semibold text-white/80 ml-0.5 mt-1">{item.unit}</span>
          </div>

          <button 
            onClick={decrement}
            onPointerDown={(e) => e.stopPropagation()} 
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 active:bg-black/60 backdrop-blur-md border border-white/20 transition-all shadow-lg z-20"
          >
            <Minus size={22} className="text-white stroke-[3px]" />
          </button>
        </div>
      </div>

      {/* Hint Icon */}
      <div className="absolute top-2 right-2 text-white drop-shadow-md pointer-events-none">
        <Plus size={20} strokeWidth={3} />
      </div>
    </div>
  );
};

export default StockCard;