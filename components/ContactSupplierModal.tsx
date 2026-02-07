import React, { useMemo, useState } from 'react';
import { X, ArrowLeft, MessageCircle, Mail, MessageSquare, Send, AlertTriangle, ChevronRight } from 'lucide-react';
import { StockItem, StockCondition, Supplier, SupplierContact } from '../types';
import { STOCK_CONDITION_CONFIG } from '../config';
import { SUPPLIERS } from '../constants';

interface ContactSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: StockItem[];
}

// Get stock condition
const getStockCondition = (qty: number, minStock: number): StockCondition => {
    const { LOW_THRESHOLD_MULTIPLIER, CUKUP_THRESHOLD_MULTIPLIER } = STOCK_CONDITION_CONFIG;
    if (qty < minStock) return 'bahaya';
    if (qty < minStock * LOW_THRESHOLD_MULTIPLIER) return 'low';
    if (qty < minStock * CUKUP_THRESHOLD_MULTIPLIER) return 'cukup';
    return 'banyak';
};

// Format items list for message
const formatItemsList = (items: StockItem[]): string => {
    return items.map(item =>
        `• ${item.name} (Stok: ${item.quantity} ${item.unit}, Min: ${item.minStock})`
    ).join('\n');
};

export default function ContactSupplierModal({ isOpen, onClose, items }: ContactSupplierModalProps) {
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [message, setMessage] = useState('');

    // Get suppliers with their critical items (bahaya or low)
    const suppliersWithCriticalItems = useMemo(() => {
        return SUPPLIERS.map(supplier => {
            const supplierItems = items.filter(item => item.supplierId === supplier.id);
            const criticalItems = supplierItems.filter(item => {
                const condition = getStockCondition(item.quantity, item.minStock);
                return condition === 'bahaya' || condition === 'low';
            });
            return { supplier, criticalItems };
        }).filter(s => s.criticalItems.length > 0); // Only show suppliers with critical items
    }, [items]);

    // Handle supplier selection
    const handleSelectSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        // Pre-fill message with template
        const supplierData = suppliersWithCriticalItems.find(s => s.supplier.id === supplier.id);
        if (supplierData) {
            const template = supplier.messageTemplate || 'Halo, kami ingin memesan:';
            const itemsList = formatItemsList(supplierData.criticalItems);
            setMessage(`${template}\n\n${itemsList}\n\nMohon konfirmasi ketersediaan dan harga. Terima kasih!`);
        }
    };

    // Handle back to supplier list
    const handleBack = () => {
        setSelectedSupplier(null);
        setMessage('');
    };

    // Get preferred contact info
    const getPreferredContact = (supplier: Supplier): SupplierContact | undefined => {
        return supplier.contacts.find(c => c.id === supplier.preferredContact) || supplier.contacts[0];
    };

    // Handle send action
    const handleSend = () => {
        if (!selectedSupplier) return;

        const contact = getPreferredContact(selectedSupplier);
        if (!contact) return;

        const encodedMessage = encodeURIComponent(message);

        switch (contact.type) {
            case 'whatsapp':
                // Remove any non-numeric characters except +
                const phone = contact.value.replace(/[^\d+]/g, '');
                window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
                break;
            case 'email':
                window.open(`mailto:${contact.value}?subject=Order Request - Warkop&body=${encodedMessage}`, '_blank');
                break;
            default:
                // SMS fallback
                const smsPhone = contact.value.replace(/[^\d+]/g, '');
                window.open(`sms:${smsPhone}?body=${encodedMessage}`, '_blank');
        }

        onClose();
    };

    // Get contact icon and label
    const getContactButton = (supplier: Supplier) => {
        const contact = getPreferredContact(supplier);
        if (!contact) return { icon: Send, label: 'Kirim', color: 'bg-gray-600' };

        switch (contact.type) {
            case 'whatsapp':
                return { icon: MessageCircle, label: 'Kirim via WhatsApp', color: 'bg-emerald-600 hover:bg-emerald-500' };
            case 'email':
                return { icon: Mail, label: 'Kirim via Email', color: 'bg-blue-600 hover:bg-blue-500' };
            default:
                return { icon: MessageSquare, label: 'Kirim via SMS', color: 'bg-purple-600 hover:bg-purple-500' };
        }
    };

    // Reset state when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setSelectedSupplier(null);
            setMessage('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const selectedSupplierData = selectedSupplier
        ? suppliersWithCriticalItems.find(s => s.supplier.id === selectedSupplier.id)
        : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 bg-gray-950 w-full max-w-lg md:max-w-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="shrink-0 p-4 md:p-5 border-b border-white/10 flex items-center gap-3">
                    {selectedSupplier ? (
                        <button
                            onClick={handleBack}
                            className="p-2 -ml-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <MessageCircle className="text-orange-400" size={20} />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="font-bold text-lg text-white">
                            {selectedSupplier ? (selectedSupplier.alias || selectedSupplier.name) : 'Hubungi Supplier'}
                        </h2>
                        <p className="text-xs text-gray-400">
                            {selectedSupplier ? 'Review & kirim pesanan' : 'Pilih supplier untuk dihubungi'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    {!selectedSupplier ? (
                        /* Supplier List View */
                        <div className="p-4 md:p-5 space-y-2">
                            {suppliersWithCriticalItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <MessageCircle className="text-green-400" size={28} />
                                    </div>
                                    <p className="text-gray-400 text-sm">Semua stok dalam kondisi baik!</p>
                                    <p className="text-gray-500 text-xs mt-1">Tidak ada item yang perlu dipesan.</p>
                                </div>
                            ) : (
                                suppliersWithCriticalItems.map(({ supplier, criticalItems }) => {
                                    const bahayaCount = criticalItems.filter(i => getStockCondition(i.quantity, i.minStock) === 'bahaya').length;
                                    const lowCount = criticalItems.filter(i => getStockCondition(i.quantity, i.minStock) === 'low').length;

                                    return (
                                        <button
                                            key={supplier.id}
                                            onClick={() => handleSelectSupplier(supplier)}
                                            className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-[0.98] text-left"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-white text-sm truncate">
                                                    {supplier.alias || supplier.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 truncate">{supplier.name}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {bahayaCount > 0 && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                                                            {bahayaCount} Bahaya
                                                        </span>
                                                    )}
                                                    {lowCount > 0 && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                                            {lowCount} Low
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-500 shrink-0" />
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        /* Request Details View */
                        <div className="p-4 md:p-5 space-y-4">
                            {/* Items Table */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <AlertTriangle size={14} />
                                    Item Perlu Restock ({selectedSupplierData?.criticalItems.length || 0})
                                </h3>
                                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-white/5 text-gray-400 font-semibold">
                                                    <th className="py-2.5 px-3 text-left">Item</th>
                                                    <th className="py-2.5 px-3 text-center">Status</th>
                                                    <th className="py-2.5 px-3 text-right">Qty</th>
                                                    <th className="py-2.5 px-3 text-center">Unit</th>
                                                    <th className="py-2.5 px-3 text-right">Min</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {selectedSupplierData?.criticalItems.map(item => {
                                                    const condition = getStockCondition(item.quantity, item.minStock);
                                                    const isBahaya = condition === 'bahaya';

                                                    return (
                                                        <tr key={item.id} className={isBahaya ? 'bg-red-500/10' : 'bg-orange-500/10'}>
                                                            <td className="py-2 px-3 text-white font-medium">{item.name}</td>
                                                            <td className="py-2 px-3 text-center">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isBahaya
                                                                        ? 'bg-red-500/30 text-red-400'
                                                                        : 'bg-orange-500/30 text-orange-400'
                                                                    }`}>
                                                                    {condition}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-3 text-right text-white">{item.quantity}</td>
                                                            <td className="py-2 px-3 text-center text-gray-400">{item.unit}</td>
                                                            <td className="py-2 px-3 text-right text-gray-400">{item.minStock}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Message Editor */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                    Pesan
                                </h3>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full h-40 md:h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all resize-none"
                                    placeholder="Tulis pesan untuk supplier..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {selectedSupplier && (
                    <div className="shrink-0 p-4 md:p-5 border-t border-white/10">
                        {(() => {
                            const { icon: Icon, label, color } = getContactButton(selectedSupplier);
                            return (
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim()}
                                    className={`w-full ${color} text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2.5 font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Icon size={18} />
                                    <span>{label}</span>
                                </button>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
