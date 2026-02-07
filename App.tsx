import React, { useState } from 'react';
import StockOpnameFeature from './components/StockOpnameFeature';
import InventoryFeature from './components/InventoryFeature';
import CheckStockFeature from './components/CheckStockFeature';
import { ClipboardCheck, ShoppingCart, BarChart3 } from 'lucide-react';

type View = 'home' | 'opname' | 'inventory' | 'checkstock';

export default function App() {
  const [view, setView] = useState<View>('home');

  if (view === 'opname') {
    return <StockOpnameFeature onBack={() => setView('home')} />;
  }

  if (view === 'inventory') {
    return <InventoryFeature onBack={() => setView('home')} />;
  }

  if (view === 'checkstock') {
    return <CheckStockFeature onBack={() => setView('home')} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <div className="flex-1 flex flex-col justify-center max-w-md md:max-w-4xl mx-auto w-full p-6">

        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2">Halo, Shift Pagi.</h1>
          <p className="text-gray-400">Pilih aktivitas untuk memulai pekerjaan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Menu Card 1: Stock Opname */}
          <button
            onClick={() => setView('opname')}
            className="group relative overflow-hidden bg-gray-900 border border-white/10 rounded-3xl p-8 text-left transition-all hover:border-emerald-500/50 hover:bg-gray-800 active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <ClipboardCheck size={120} />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 text-emerald-500">
                <ClipboardCheck size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Stock Opname</h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
                Cek jumlah fisik barang yang ada di toko saat ini.
              </p>
            </div>
          </button>

          {/* Menu Card 2: Input Stock */}
          <button
            onClick={() => setView('inventory')}
            className="group relative overflow-hidden bg-gray-900 border border-white/10 rounded-3xl p-8 text-left transition-all hover:border-blue-500/50 hover:bg-gray-800 active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <ShoppingCart size={120} />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-500">
                <ShoppingCart size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Input Stok</h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
                Scan struk belanja untuk restock barang masuk.
              </p>
            </div>
          </button>

          {/* Menu Card 3: Check Stock */}
          <button
            onClick={() => setView('checkstock')}
            className="group relative overflow-hidden bg-gray-900 border border-white/10 rounded-3xl p-8 text-left transition-all hover:border-purple-500/50 hover:bg-gray-800 active:scale-[0.98]"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <BarChart3 size={120} />
            </div>

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-500">
                <BarChart3 size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Cek Stok</h2>
              <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
                Lihat laporan stok dan kondisi barang saat ini.
              </p>
            </div>
          </button>
        </div>

      </div>

      <footer className="p-6 text-center">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          Inventory Management System
        </p>
      </footer>
    </div>
  );
}