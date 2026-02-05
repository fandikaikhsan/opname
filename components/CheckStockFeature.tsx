import React, { useMemo } from 'react';
import { StockItem, StockCondition } from '../types';
import { WARKOP_ITEMS } from '../constants';
import { STOCK_CONDITION_CONFIG, STOCK_REPORT_INFO } from '../config';
import { ArrowLeft, FileText, Phone, User, Clock } from 'lucide-react';

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

    return (
        <div className="min-h-screen bg-black text-white pb-32 font-sans animate-slide-up">
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
                    <div className="flex flex-wrap gap-2">
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
                </div>
            </header>

            {/* Table */}
            <main className="p-4 max-w-md md:max-w-7xl mx-auto">
                <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-gray-900/90 sticky top-0 z-10">
                                <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10">
                                    <th className="py-4 px-5">Item</th>
                                    <th className="py-4 px-3 text-center">Kondisi</th>
                                    <th className="py-4 px-3 text-right">Qty</th>
                                    <th className="py-4 px-3 text-center">Unit</th>
                                    <th className="py-4 px-3 text-right">Min Restock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {items.map((item) => {
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

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/95 to-transparent pointer-events-none z-40">
                <div className="max-w-md md:max-w-lg mx-auto pointer-events-auto flex gap-3">
                    <button
                        className="flex-1 bg-gray-800 border border-white/10 rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 text-gray-400 font-bold text-sm opacity-60 cursor-not-allowed"
                        disabled
                    >
                        <FileText size={18} />
                        <span>Generate Report</span>
                    </button>
                    <button
                        className="flex-1 bg-gray-800 border border-white/10 rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 text-gray-400 font-bold text-sm opacity-60 cursor-not-allowed"
                        disabled
                    >
                        <Phone size={18} />
                        <span>Contact Supplier</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
