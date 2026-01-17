import React, { useState } from 'react';
import { StockItem } from '../types';
import { X, AlertTriangle, ChevronRight, ClipboardList, CheckCircle2, CircleDashed } from 'lucide-react';

interface SummarySheetProps {
  items: StockItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

type Tab = 'filled' | 'empty';

const SummarySheet: React.FC<SummarySheetProps> = ({ items, isOpen, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<Tab>('filled');

  const filledItems = items.filter(item => item.quantity > 0);
  const emptyItems = items.filter(item => item.quantity === 0);
  
  const displayItems = activeTab === 'filled' ? filledItems : emptyItems;
  const totalCount = filledItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalItems = items.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative z-10 bg-gray-950 w-full max-w-md rounded-t-3xl border-t border-white/10 shadow-2xl flex flex-col h-[90vh] animate-slide-up overflow-hidden">
        
        {/* Header */}
        <div className="shrink-0 pt-5 px-5 pb-0 bg-gray-950">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                 <ClipboardList className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-xl text-white">Cek Stok</h2>
                <p className="text-xs text-gray-400">Verifikasi data opname</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-white/5 rounded-xl mb-4 border border-white/5">
            <button
              onClick={() => setActiveTab('filled')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'filled' 
                  ? 'bg-gray-800 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <CheckCircle2 size={16} className={activeTab === 'filled' ? 'text-emerald-500' : ''} />
              <span>Sudah Diisi ({filledItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('empty')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'empty' 
                  ? 'bg-gray-800 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <CircleDashed size={16} className={activeTab === 'empty' ? 'text-orange-500' : ''} />
              <span>Belum ({emptyItems.length})</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-black p-0 border-t border-white/5">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center pb-20">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4">
                 <AlertTriangle className="text-gray-500" size={32} />
              </div>
              <p className="font-bold text-lg text-white">
                {activeTab === 'filled' ? 'Belum ada data' : 'Semua sudah terisi!'}
              </p>
              <p className="text-sm mt-2 text-gray-500 leading-relaxed">
                {activeTab === 'filled' 
                  ? 'Input stok barang untuk melihat daftar ini.' 
                  : 'Luar biasa, semua barang sudah dihitung.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-900/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10">
                  <th className="py-3 px-5">Nama Barang</th>
                  <th className="py-3 px-5 text-right">Jml</th>
                  <th className="py-3 px-5 text-right">Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displayItems.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 align-middle">
                      <p className="font-medium text-white text-sm leading-snug">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-gray-400 font-medium">
                          {item.category}
                        </span>
                        {item.quantity > 0 && item.quantity < item.minStock && (
                          <span className="text-[9px] text-red-400 font-bold">Stok Tipis</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right align-middle">
                      <span className={`text-xl font-bold tabular-nums tracking-tight ${
                        item.quantity === 0 ? 'text-gray-600' :
                        item.quantity < item.minStock ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right align-middle">
                      <span className="text-xs text-gray-600 font-medium">{item.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-white/10 bg-gray-950 pb-8">
           <div className="flex justify-between items-center mb-5 px-1">
             <div className="flex flex-col">
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Progres</span>
               <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-bold text-white tracking-tight">{filledItems.length}</span>
                 <span className="text-sm font-bold text-gray-600">/{totalItems}</span>
               </div>
             </div>
             <div className="flex flex-col items-end">
               <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Unit</span>
               <span className="text-2xl font-bold text-white tracking-tight">{totalCount}</span>
             </div>
           </div>
          <button 
            onClick={onSubmit}
            disabled={filledItems.length === 0}
            className={`
              w-full font-bold text-lg py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all
              ${filledItems.length === 0 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-white text-black hover:bg-gray-100 active:scale-[0.98] shadow-white/5'
              }
            `}
          >
            <span>Kirim Laporan</span>
            <ChevronRight size={20} className={filledItems.length === 0 ? 'opacity-30' : 'opacity-60'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummarySheet;