import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import { PackageCheck, Banknote, Clock, Receipt, ChevronRight, CheckCircle2 } from 'lucide-react';

interface InventoryCardProps {
  invoice: Invoice;
  onClick: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ invoice, onClick, onDelete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const isComplete = invoice.status.itemsReceived && invoice.status.paymentSent;

  // Formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  useEffect(() => {
    if (isComplete) {
      // Delay removal to allow user to see the "Completed" state for a moment if they just toggled it
      // But usually this component re-renders from parent state update. 
      // If parent handles removal immediately, this effect might not run or be needed.
      // Assuming parent keeps it until we trigger delete here or parent filters it.
      // Based on previous code, we trigger onDelete after animation.
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
            onDelete(invoice.id);
        }, 500); 
      }, 2000); // Wait longer (2s) so user sees "Selesai" status
      return () => clearTimeout(timer);
    }
  }, [isComplete, invoice.id, onDelete]);

  // Determine Status Label
  let statusLabel = "Invoice Diterima";
  let statusColor = "bg-gray-700 text-gray-300";
  
  if (invoice.status.itemsReceived && !invoice.status.paymentSent) {
      statusLabel = "Barang Diterima";
      statusColor = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  } else if (!invoice.status.itemsReceived && invoice.status.paymentSent) {
      statusLabel = "Sudah Bayar";
      statusColor = "bg-blue-500/20 text-blue-400 border border-blue-500/30";
  } else if (isComplete) {
      statusLabel = "Selesai";
      statusColor = "bg-green-500 text-black font-bold";
  }

  return (
    <div 
        onClick={() => onClick(invoice)}
        className={`
          relative bg-gray-900/50 border border-white/10 rounded-2xl p-5 shadow-lg overflow-hidden transition-all duration-500 cursor-pointer hover:bg-gray-800/50 active:scale-[0.98] group
          ${isExiting ? 'opacity-0 translate-x-full mb-[-100px]' : 'opacity-100'}
          ${isComplete ? 'border-emerald-500/50 bg-emerald-900/20' : ''}
        `}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition-opacity">
         <Receipt size={100} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{invoice.supplierName}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{invoice.date}</span>
                    <span>•</span>
                    <span>{invoice.items.length} Item</span>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="block text-emerald-400 font-bold text-base tracking-tight">{formatCurrency(invoice.totalAmount)}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-1 transition-colors duration-300 w-fit text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] ${statusColor}`}>
                    {statusLabel}
                </span>
            </div>
        </div>

        {/* Mini Preview of Items (First 2) */}
        <div className="space-y-1 mt-3">
             {invoice.items.slice(0, 2).map((item, idx) => (
                 <div key={idx} className="flex justify-between text-xs text-gray-400">
                     <span>{item.name}</span>
                     <span className="font-mono text-gray-600">x{item.qty}</span>
                 </div>
             ))}
             {invoice.items.length > 2 && (
                 <div className="text-[10px] text-gray-600 pt-1">+ {invoice.items.length - 2} barang lainnya</div>
             )}
        </div>

        {/* Chevron CTA */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
            <div className="bg-white/10 p-1.5 rounded-full text-white">
                <ChevronRight size={16} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCard;