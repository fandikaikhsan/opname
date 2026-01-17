import React from 'react';
import { Invoice } from '../types';
import { X, Calendar, PackageCheck, Banknote, Receipt, CheckCircle2 } from 'lucide-react';

interface InventoryDetailSheetProps {
  invoice: Invoice | null;
  onClose: () => void;
  onUpdateStatus: (id: string, type: 'itemsReceived' | 'paymentSent') => void;
}

const InventoryDetailSheet: React.FC<InventoryDetailSheetProps> = ({ invoice, onClose, onUpdateStatus }) => {
  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative z-10 bg-gray-950 w-full max-w-md md:max-w-2xl rounded-t-3xl md:rounded-3xl md:mb-6 border-t md:border border-white/10 shadow-2xl flex flex-col h-[85vh] animate-slide-up overflow-hidden">
        
        {/* Header */}
        <div className="shrink-0 p-5 border-b border-white/5 flex items-start justify-between bg-gray-900/50">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <h2 className="text-xl font-bold text-white leading-tight">{invoice.supplierName}</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                 <span className="flex items-center gap-1"><Calendar size={12} /> {invoice.date}</span>
                 <span className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300">{invoice.items.length} Items</span>
              </div>
           </div>
           <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* Amount Section */}
            <div className="text-center py-4 bg-emerald-900/10 rounded-2xl border border-emerald-500/10">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Total Tagihan</span>
                <div className="text-3xl font-black text-white mt-1">{formatCurrency(invoice.totalAmount)}</div>
            </div>

            {/* Receipt Image */}
            {invoice.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                   <div className="p-3 bg-gray-900 border-b border-white/5 flex items-center gap-2 text-xs font-bold text-gray-400">
                      <Receipt size={14} /> Bukti Transaksi
                   </div>
                   <img src={invoice.imageUrl} alt="Receipt" className="w-full h-auto max-h-[300px] object-contain opacity-80 hover:opacity-100 transition-opacity" />
                </div>
            )}

            {/* Items List */}
            <div>
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Rincian Barang</h3>
                <div className="bg-white/5 rounded-xl overflow-hidden border border-white/5">
                    {invoice.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border-b border-white/5 last:border-0 hover:bg-white/5">
                            <span className="text-gray-200 text-sm font-medium">{item.name}</span>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500 font-mono">{item.qty} {item.unit}</span>
                                {/* Optional: show price per item if we had it per item logic fully fleshed out, for now simple */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Space at bottom for buttons */}
            <div className="h-20"></div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-gray-950 to-transparent">
            <div className="flex gap-3">
                <button 
                    onClick={() => onUpdateStatus(invoice.id, 'itemsReceived')}
                    disabled={invoice.status.itemsReceived}
                    className={`
                        flex-1 py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden border
                        ${invoice.status.itemsReceived 
                            ? 'bg-emerald-950 text-emerald-500 border-emerald-900' 
                            : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 active:scale-[0.98]'
                        }
                    `}
                >
                    {invoice.status.itemsReceived ? (
                         <>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={20} />
                                <span>Diterima</span>
                            </div>
                            <span className="text-[10px] opacity-60 font-normal">Stok telah diupdate</span>
                         </>
                    ) : (
                         <>
                            <PackageCheck size={24} className="mb-0.5" />
                            <span>Terima Barang</span>
                         </>
                    )}
                </button>

                <button 
                    onClick={() => onUpdateStatus(invoice.id, 'paymentSent')}
                    disabled={invoice.status.paymentSent}
                    className={`
                        flex-1 py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden border
                        ${invoice.status.paymentSent
                            ? 'bg-blue-950 text-blue-500 border-blue-900' 
                            : 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700 active:scale-[0.98]'
                        }
                    `}
                >
                    {invoice.status.paymentSent ? (
                        <>
                             <div className="flex items-center gap-2">
                                <CheckCircle2 size={20} />
                                <span>Terbayar</span>
                            </div>
                             <span className="text-[10px] opacity-60 font-normal">Pembayaran dikonfirmasi</span>
                        </>
                    ) : (
                        <>
                            <Banknote size={24} className="mb-0.5" />
                            <span>Konfirmasi Bayar</span>
                        </>
                    )}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default InventoryDetailSheet;