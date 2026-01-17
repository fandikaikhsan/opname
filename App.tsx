import React, { useState, useMemo } from 'react';
import { StockItem } from './types';
import { WARKOP_ITEMS } from './constants';
import StockCard from './components/StockCard';
import SummarySheet from './components/SummarySheet';
import { ClipboardList, Search, Menu, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<StockItem[]>(WARKOP_ITEMS);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Changed to track expanded state instead of collapsed, defaulting to closed (false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  const updatedCount = items.reduce((acc, item) => item.quantity > 0 ? acc + 1 : acc, 0);
  const totalItems = items.length;

  // Filter items based on search query
  const filteredItems = useMemo(() => items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  ), [items, searchQuery]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, StockItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const categoryNames = Object.keys(groupedItems);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleUpdateStock = (id: number, newQty: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity: Math.max(0, newQty) } : item
      )
    );
  };

  const handleSubmit = () => {
    alert(`Mengirim laporan opname untuk ${updatedCount} barang!`);
    setIsSummaryOpen(false);
  };

  const handleJumpToItem = (item: StockItem) => {
    // 1. Close Modal
    setIsSummaryOpen(false);

    // 2. Expand Category (Set to true)
    setExpandedCategories(prev => ({
      ...prev,
      [item.category]: true
    }));

    // 3. Scroll to item (Wait for render/animation frame)
    setTimeout(() => {
      const element = document.getElementById(`item-${item.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: Add a flash effect or focus here if desired
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-40 font-sans">
      
      {/* Sticky Header Container (Includes Top Bar & Search) */}
      <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50">
        {/* Top Bar */}
        <div className="flex justify-between items-center max-w-md md:max-w-7xl mx-auto px-4 py-4 transition-all duration-300">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Opname.</h1>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            </div>
            <p className="text-xs text-gray-400 font-medium">Shift Pagi - Sarjana Warkop</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:bg-white/10 transition-colors">
             <Menu size={20} />
          </div>
        </div>

        {/* Search Bar (Now part of sticky header) */}
        <div className="px-4 pb-4 max-w-md md:max-w-7xl mx-auto transition-all duration-300">
          <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 focus-within:border-white/20 focus-within:bg-white/10 transition-all">
             <Search size={20} className="text-gray-500 ml-1 shrink-0" />
             <input 
               type="text" 
               placeholder="Cari barang..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-transparent outline-none text-base placeholder:text-gray-600 font-medium text-gray-200"
             />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md md:max-w-7xl mx-auto space-y-6 transition-all duration-300">
        {categoryNames.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p className="text-lg font-bold text-gray-400">Barang tidak ditemukan</p>
            <p className="text-sm text-gray-600">Coba kata kunci lain</p>
          </div>
        ) : (
          categoryNames.map(category => {
            // Expand automatically if searching, otherwise use state (default false)
            const isExpanded = expandedCategories[category] || searchQuery.length > 0;
            const itemsInCategory = groupedItems[category];
            
            return (
              <div key={category} className="space-y-3">
                {/* Accordion Header */}
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between py-2 group"
                >
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white tracking-tight">{category}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-gray-400">
                      {itemsInCategory.length}
                    </span>
                  </div>
                  <div className={`p-1.5 rounded-full bg-white/5 text-gray-400 transition-all duration-300 ${!isExpanded ? '-rotate-90' : 'rotate-0'}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Items Grid (Collapsible) */}
                <div 
                  className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 md:gap-5 transition-all duration-300 ease-in-out overflow-hidden ${
                    !isExpanded ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
                  }`}
                >
                  {itemsInCategory.map(item => (
                    <StockCard 
                      key={item.id} 
                      item={item} 
                      onUpdate={handleUpdateStock} 
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none z-40">
        <div className="max-w-md md:max-w-lg mx-auto pointer-events-auto transition-all duration-300">
          <button 
            onClick={() => setIsSummaryOpen(true)}
            className="group w-full bg-gray-900 border border-white/10 rounded-2xl p-1.5 flex items-center justify-between transition-all active:scale-[0.98] shadow-2xl shadow-black/80"
          >
            {/* Button Left Content */}
            <div className="flex items-center gap-4 bg-white/10 rounded-xl px-4 py-3.5 flex-1 border border-white/5">
               <div className="relative">
                 <ClipboardList size={24} className="text-white" />
                 {updatedCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-gray-800 rounded-full"></span>
                 )}
               </div>
               <div className="text-left flex flex-col">
                 <span className="font-bold text-sm text-white">Cek Laporan</span>
                 <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Ketuk untuk selesai</span>
               </div>
            </div>
            
            {/* Button Right Content (Counter x/y) */}
            <div className="px-6 flex flex-col items-center justify-center min-w-[80px]">
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-black text-white leading-none">{updatedCount}</span>
                <span className="text-sm font-bold text-gray-500">/{totalItems}</span>
              </div>
              <span className="text-[9px] text-gray-500 font-bold uppercase mt-1 tracking-wider">Progres</span>
            </div>
          </button>
        </div>
      </div>

      {/* Summary Modal/Sheet */}
      <SummarySheet 
        items={items} 
        isOpen={isSummaryOpen} 
        onClose={() => setIsSummaryOpen(false)}
        onSubmit={handleSubmit}
        onItemClick={handleJumpToItem}
      />
    </div>
  );
}