import React, { useState } from 'react';
import { ArrowLeft, Plus, History } from 'lucide-react';
import { Invoice } from '../types';
import InventoryCard from './InventoryCard';
import ScannerModal from './ScannerModal';
import InventoryDetailSheet from './InventoryDetailSheet';

interface Props {
  onBack: () => void;
}

export default function InventoryFeature({ onBack }: Props) {
  // Mock initial data or empty
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handleUpdateStatus = (id: string, type: 'itemsReceived' | 'paymentSent') => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: {
            ...inv.status,
            [type]: true
          }
        };
      }
      return inv;
    }));

    // Also update selected invoice to reflect changes in the open sheet immediately
    if (selectedInvoice && selectedInvoice.id === id) {
        setSelectedInvoice(prev => prev ? {
            ...prev,
            status: {
                ...prev.status,
                [type]: true
            }
        } : null);
    }
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const handleDelete = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    if (selectedInvoice?.id === id) {
        setSelectedInvoice(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans animate-slide-up">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-md md:max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-white/10 text-gray-400 hover:text-white transition-colors">
               <ArrowLeft size={24} />
             </button>
             <div>
                <h1 className="text-xl font-black tracking-tight text-white">Input Stok.</h1>
                <p className="text-xs text-gray-400">Pantau Pembelian & Penerimaan</p>
             </div>
           </div>
           <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
             <History size={20} />
           </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 max-w-md md:max-w-7xl mx-auto space-y-4">
         {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Plus size={32} className="text-gray-500" />
                </div>
                <p className="font-bold text-lg text-gray-300">Belum ada restock</p>
                <p className="text-sm text-gray-500 max-w-[200px] mt-1">Tap tombol + di bawah untuk scan struk belanjaan baru.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoices.map(invoice => (
                    <InventoryCard 
                        key={invoice.id} 
                        invoice={invoice} 
                        onClick={setSelectedInvoice}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
         )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
            onClick={() => setIsScannerOpen(true)}
            className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        >
            <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onSave={handleAddInvoice}
      />

      <InventoryDetailSheet 
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}