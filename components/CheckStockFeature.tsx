import React, { useMemo, useState } from 'react';
import { StockItem, StockCondition } from '../types';
import { WARKOP_ITEMS } from '../constants';
import { STOCK_CONDITION_CONFIG, STOCK_REPORT_INFO } from '../config';
import { ArrowLeft, FileText, Phone, User, Clock, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import ReportModal from './ReportModal';
import ContactSupplierModal from './ContactSupplierModal';

type SortColumn = 'name' | 'condition' | 'quantity' | 'unit' | 'minStock';
type SortDirection = 'asc' | 'desc';

// Condition priority for sorting (lower = more critical)
const CONDITION_PRIORITY: Record<StockCondition, number> = {
    bahaya: 0,
    low: 1,
    cukup: 2,
    banyak: 3,
};

interface Props {
    onBack: () => void;
}

// Get stock condition based on quantity vs minStock
const getStockCondition = (qty: number, minStock: number): StockCondition => {
    const { LOW_THRESHOLD_MULTIPLIER, CUKUP_THRESHOLD_MULTIPLIER } = STOCK_CONDITION_CONFIG;

    if (qty < minStock) return 'bahaya';
    if (qty < minStock * LOW_THRESHOLD_MULTIPLIER) return 'low';
    if (qty < minStock * CUKUP_THRESHOLD_MULTIPLIER) return 'cukup';
    return 'banyak';
};

// Condition chip styling
const getConditionStyle = (condition: StockCondition) => {
    switch (condition) {
        case 'bahaya':
            return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'low':
            return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'cukup':
            return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
        case 'banyak':
            return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
};

const getConditionLabel = (condition: StockCondition) => {
    switch (condition) {
        case 'bahaya': return 'Bahaya';
        case 'low': return 'Low';
        case 'cukup': return 'Cukup';
        case 'banyak': return 'Banyak';
    }
};

export default function CheckStockFeature({ onBack }: Props) {
    // Use mock data - in real app this would come from backend
    const items: StockItem[] = useMemo(() => {
        // Simulate some items having varying quantities for demo
        return WARKOP_ITEMS.map((item, i) => ({
            ...item,
            quantity: [5, 12, 25, 8, 3, 30, 15, 22, 55, 18, 24, 6][i] || 10
        }));
    }, []);

    // Calculate condition counts
    const conditionCounts = useMemo(() => {
        const counts: Record<StockCondition, number> = { bahaya: 0, low: 0, cukup: 0, banyak: 0 };
        items.forEach(item => {
            const condition = getStockCondition(item.quantity, item.minStock);
            counts[condition]++;
        });
        return counts;
    }, [items]);

    // Sorting state
    const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    // Report modal state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Contact supplier modal state
    const [isContactSupplierModalOpen, setIsContactSupplierModalOpen] = useState(false);

    // Filtered items based on search
    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return items;
        const query = searchQuery.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    // Handle column header click
    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            // Toggle direction if same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // New column, start with ascending
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Sort icon component
    const SortIcon = ({ column }: { column: SortColumn }) => {
        if (sortColumn !== column) {
            return <ArrowUpDown size={12} className="opacity-40" />;
        }
        return sortDirection === 'asc'
            ? <ArrowUp size={12} className="text-purple-400" />
            : <ArrowDown size={12} className="text-purple-400" />;
    };

    // Sorted items (apply to filtered items)
    const sortedItems = useMemo(() => {
        if (!sortColumn) return filteredItems;

        return [...filteredItems].sort((a, b) => {
            let comparison = 0;

            switch (sortColumn) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'condition':
                    const condA = getStockCondition(a.quantity, a.minStock);
                    const condB = getStockCondition(b.quantity, b.minStock);
                    comparison = CONDITION_PRIORITY[condA] - CONDITION_PRIORITY[condB];
                    break;
                case 'quantity':
                    comparison = a.quantity - b.quantity;
                    break;
                case 'unit':
                    comparison = a.unit.localeCompare(b.unit);
                    break;
                case 'minStock':
                    comparison = a.minStock - b.minStock;
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredItems, sortColumn, sortDirection]);

    return (
        <div className="min-h-screen bg-black text-white pb-40 font-sans">
            {/* Scrollable Content Wrapper with Animation */}
            <div className="animate-slide-up">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/10">
                    <div className="max-w-md md:max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-white/10 text-gray-400 hover:text-white transition-colors">
                                    <ArrowLeft size={24} />
                                </button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-black tracking-tight text-white">Cek Stok.</h1>
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">Laporan Stok Saat Ini</p>
                                </div>
                            </div>
                        </div>

                        {/* Info Bar */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                                <User size={14} className="text-gray-400" />
                                <span className="text-xs text-gray-300 font-medium">{STOCK_REPORT_INFO.staffName}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                                <Clock size={14} className="text-gray-400" />
                                <span className="text-xs text-gray-300 font-medium">{STOCK_REPORT_INFO.lastUpdated}</span>
                            </div>
                        </div>

                        {/* Status Summary Chips */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {(['bahaya', 'low', 'cukup', 'banyak'] as StockCondition[]).map(condition => (
                                <div
                                    key={condition}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getConditionStyle(condition)}`}
                                >
                                    <span className="capitalize">{getConditionLabel(condition)}:</span>
                                    <span>{conditionCounts[condition]}</span>
                                </div>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/5 focus-within:border-white/20 focus-within:bg-white/10 transition-all">
                            <Search size={20} className="text-gray-500 ml-1 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari Item..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent outline-none text-base placeholder:text-gray-600 font-medium text-gray-200"
                            />
                        </div>
                    </div>
                </header>

                {/* Table */}
                <main className="p-4 max-w-md md:max-w-7xl mx-auto">
                    <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="bg-gray-900/90 sticky top-0 z-10">
                                    <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10">
                                        <th
                                            className="py-4 px-5 cursor-pointer hover:text-gray-300 transition-colors select-none"
                                            onClick={() => handleSort('name')}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span>Item</span>
                                                <SortIcon column="name" />
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-3 text-center cursor-pointer hover:text-gray-300 transition-colors select-none"
                                            onClick={() => handleSort('condition')}
                                        >
                                            <div className="flex items-center justify-center gap-1.5">
                                                <span>Kondisi</span>
                                                <SortIcon column="condition" />
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-3 text-right cursor-pointer hover:text-gray-300 transition-colors select-none"
                                            onClick={() => handleSort('quantity')}
                                        >
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span>Qty</span>
                                                <SortIcon column="quantity" />
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-3 text-center cursor-pointer hover:text-gray-300 transition-colors select-none"
                                            onClick={() => handleSort('unit')}
                                        >
                                            <div className="flex items-center justify-center gap-1.5">
                                                <span>Unit</span>
                                                <SortIcon column="unit" />
                                            </div>
                                        </th>
                                        <th
                                            className="py-4 px-3 text-right cursor-pointer hover:text-gray-300 transition-colors select-none"
                                            onClick={() => handleSort('minStock')}
                                        >
                                            <div className="flex items-center justify-end gap-1.5">
                                                <span>Min Restock</span>
                                                <SortIcon column="minStock" />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sortedItems.map((item) => {
                                        const condition = getStockCondition(item.quantity, item.minStock);
                                        return (
                                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 px-5">
                                                    <p className="font-medium text-white text-sm">{item.name}</p>
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-gray-400 font-medium mt-1 inline-block">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3 text-center">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${getConditionStyle(condition)}`}>
                                                        {getConditionLabel(condition)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3 text-right">
                                                    <span className={`text-lg font-bold tabular-nums ${condition === 'bahaya' ? 'text-red-400' :
                                                        condition === 'low' ? 'text-orange-400' :
                                                            condition === 'cukup' ? 'text-teal-400' : 'text-emerald-400'
                                                        }`}>
                                                        {item.quantity}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-3 text-center">
                                                    <span className="text-xs text-gray-500 font-medium">{item.unit}</span>
                                                </td>
                                                <td className="py-4 px-3 text-right">
                                                    <span className="text-sm text-gray-400 font-medium">{item.minStock}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Sticky Bottom Floating Button Bar - OUTSIDE animation wrapper */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none z-40">
                <div className="max-w-md md:max-w-lg mx-auto pointer-events-auto transition-all duration-300">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-1.5 flex gap-2 shadow-2xl shadow-black/80">
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="group flex-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl px-4 py-3.5 flex items-center justify-center gap-2.5 border border-purple-500/30 text-purple-400 font-bold text-sm transition-all active:scale-[0.98]"
                        >
                            <FileText size={18} />
                            <span>Generate Report</span>
                        </button>
                        <button
                            onClick={() => setIsContactSupplierModalOpen(true)}
                            className="group flex-1 bg-orange-500/20 hover:bg-orange-500/30 rounded-xl px-4 py-3.5 flex items-center justify-center gap-2.5 border border-orange-500/30 text-orange-400 font-bold text-sm transition-all active:scale-[0.98]"
                        >
                            <Phone size={18} />
                            <span>Contact Supplier</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                items={items}
            />

            {/* Contact Supplier Modal */}
            <ContactSupplierModal
                isOpen={isContactSupplierModalOpen}
                onClose={() => setIsContactSupplierModalOpen(false)}
                items={items}
            />
        </div>
    );
}
