import React, { useMemo, useRef, useEffect, useState } from 'react';
import { X, Download, MessageCircle, FileText, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { StockItem, StockCondition, Supplier } from '../types';
import { STOCK_CONDITION_CONFIG, STOCK_REPORT_INFO } from '../config';
import { SUPPLIERS } from '../constants';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: StockItem[];
}

// Condition priority for sorting (lower = more critical)
const CONDITION_PRIORITY: Record<StockCondition, number> = {
    bahaya: 0,
    low: 1,
    cukup: 2,
    banyak: 3,
};

// Get stock condition
const getStockCondition = (qty: number, minStock: number): StockCondition => {
    const { LOW_THRESHOLD_MULTIPLIER, CUKUP_THRESHOLD_MULTIPLIER } = STOCK_CONDITION_CONFIG;
    if (qty < minStock) return 'bahaya';
    if (qty < minStock * LOW_THRESHOLD_MULTIPLIER) return 'low';
    if (qty < minStock * CUKUP_THRESHOLD_MULTIPLIER) return 'cukup';
    return 'banyak';
};

// Condition colors for PDF (RGB)
const CONDITION_COLORS: Record<StockCondition, [number, number, number]> = {
    bahaya: [254, 202, 202],   // Light red
    low: [254, 215, 170],      // Light orange
    cukup: [153, 246, 228],    // Light teal
    banyak: [167, 243, 208],   // Light green
};

const CONDITION_TEXT_COLORS: Record<StockCondition, [number, number, number]> = {
    bahaya: [185, 28, 28],     // Dark red
    low: [180, 83, 9],         // Dark orange
    cukup: [17, 94, 89],       // Dark teal
    banyak: [6, 95, 70],       // Dark green
};

export default function ReportModal({ isOpen, onClose, items }: ReportModalProps) {
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Group items by supplier and sort by condition
    const groupedItems = useMemo(() => {
        const groups: Record<string, { supplier: Supplier; items: StockItem[] }> = {};

        items.forEach(item => {
            const supplierId = item.supplierId;
            if (!groups[supplierId]) {
                const supplier = SUPPLIERS.find(s => s.id === supplierId);
                if (supplier) {
                    groups[supplierId] = { supplier, items: [] };
                }
            }
            if (groups[supplierId]) {
                groups[supplierId].items.push(item);
            }
        });

        // Sort items within each group by condition (critical first)
        Object.values(groups).forEach(group => {
            group.items.sort((a, b) => {
                const condA = getStockCondition(a.quantity, a.minStock);
                const condB = getStockCondition(b.quantity, b.minStock);
                return CONDITION_PRIORITY[condA] - CONDITION_PRIORITY[condB];
            });
        });

        return groups;
    }, [items]);

    // Generate PDF
    const generatePDF = () => {
        setIsGenerating(true);

        setTimeout(() => {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 15;
            let y = 20;

            // Title
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Laporan Stok Warkop', margin, y);
            y += 10;

            // Subtitle with date
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            const now = new Date();
            const generatedDate = now.toLocaleString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            doc.text(`Dibuat: ${generatedDate}`, margin, y);
            y += 5;
            doc.text(`Opname terakhir: ${STOCK_REPORT_INFO.staffName} - ${STOCK_REPORT_INFO.lastUpdated}`, margin, y);
            y += 10;

            // Divider line
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y, pageWidth - margin, y);
            y += 10;

            // For each supplier group
            const supplierGroups = Object.values(groupedItems) as { supplier: Supplier; items: StockItem[] }[];
            supplierGroups.forEach((group) => {
                // Check if we need a new page
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }

                // Supplier header
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                doc.text(group.supplier.alias || group.supplier.name, margin, y);
                y += 6;

                // Table header
                const colWidths = [70, 25, 20, 20, 25];
                const headers = ['Item', 'Kondisi', 'Qty', 'Unit', 'Min'];

                doc.setFillColor(240, 240, 240);
                doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');

                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(80, 80, 80);

                let xPos = margin + 2;
                headers.forEach((header, i) => {
                    doc.text(header, xPos, y);
                    xPos += colWidths[i];
                });
                y += 8;

                // Table rows
                doc.setFont('helvetica', 'normal');
                group.items.forEach(item => {
                    // Check if we need a new page
                    if (y > 275) {
                        doc.addPage();
                        y = 20;
                    }

                    const condition = getStockCondition(item.quantity, item.minStock);
                    const bgColor = CONDITION_COLORS[condition];
                    const textColor = CONDITION_TEXT_COLORS[condition];

                    // Row background
                    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                    doc.rect(margin, y - 4, pageWidth - margin * 2, 7, 'F');

                    // Row content
                    doc.setFontSize(8);
                    doc.setTextColor(0, 0, 0);

                    xPos = margin + 2;

                    // Item name (truncate if too long)
                    const itemName = item.name.length > 28 ? item.name.substring(0, 28) + '...' : item.name;
                    doc.text(itemName, xPos, y);
                    xPos += colWidths[0];

                    // Condition
                    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                    doc.setFont('helvetica', 'bold');
                    doc.text(condition.toUpperCase(), xPos, y);
                    xPos += colWidths[1];

                    // Qty
                    doc.setTextColor(0, 0, 0);
                    doc.setFont('helvetica', 'normal');
                    doc.text(item.quantity.toString(), xPos, y);
                    xPos += colWidths[2];

                    // Unit
                    doc.text(item.unit, xPos, y);
                    xPos += colWidths[3];

                    // Min
                    doc.text(item.minStock.toString(), xPos, y);

                    y += 7;
                });

                y += 8; // Gap between suppliers
            });

            // Generate blob for preview and download
            const blob = doc.output('blob');
            setPdfBlob(blob);
            setPdfUrl(URL.createObjectURL(blob));
            setIsGenerating(false);
        }, 100);
    };

    // Generate PDF when modal opens
    useEffect(() => {
        if (isOpen) {
            generatePDF();
        }
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [isOpen, items]);

    // Handle download
    const handleDownload = () => {
        if (pdfBlob) {
            const link = document.createElement('a');
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            link.href = URL.createObjectURL(pdfBlob);
            link.download = `laporan-stok-${dateStr}.pdf`;
            link.click();
        }
    };

    // Handle WhatsApp share
    const handleWhatsAppShare = () => {
        const message = encodeURIComponent(
            `📊 *Laporan Stok Warkop*\n\n` +
            `Dibuat: ${new Date().toLocaleString('id-ID')}\n` +
            `Opname terakhir: ${STOCK_REPORT_INFO.staffName}\n\n` +
            `Download PDF untuk detail lengkap.`
        );
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 bg-gray-950 w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl flex flex-col h-full overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="shrink-0 p-5 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <FileText className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-white">Laporan Stok</h2>
                            <p className="text-xs text-gray-400">Preview PDF</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Report Preview - Clean HTML View */}
                <div className="flex-1 bg-gray-800 overflow-auto">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Loader2 className="animate-spin text-purple-500" size={40} />
                            <p className="text-gray-400 text-sm">Membuat laporan...</p>
                        </div>
                    ) : (
                        <div className="bg-white text-black p-6 min-h-full">
                            {/* Report Header */}
                            <h1 className="text-xl font-bold text-gray-900 mb-2">Laporan Stok Warkop</h1>
                            <div className="text-xs text-gray-500 mb-1">
                                Dibuat: {new Date().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <div className="text-xs text-gray-500 mb-4">
                                Opname terakhir: {STOCK_REPORT_INFO.staffName} - {STOCK_REPORT_INFO.lastUpdated}
                            </div>
                            <div className="border-t border-gray-200 mb-6"></div>

                            {/* Supplier Groups */}
                            {(Object.values(groupedItems) as { supplier: Supplier; items: StockItem[] }[]).map((group) => (
                                <div key={group.supplier.id} className="mb-6">
                                    <h2 className="font-bold text-sm text-gray-800 mb-2">
                                        {group.supplier.alias || group.supplier.name}
                                    </h2>

                                    {/* Table */}
                                    <table className="w-full text-[11px] border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 font-semibold">
                                                <th className="py-1.5 px-2 text-left">Item</th>
                                                <th className="py-1.5 px-2 text-center">Kondisi</th>
                                                <th className="py-1.5 px-2 text-right">Qty</th>
                                                <th className="py-1.5 px-2 text-center">Unit</th>
                                                <th className="py-1.5 px-2 text-right">Min</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.items.map((item) => {
                                                const condition = getStockCondition(item.quantity, item.minStock);
                                                const rowBgClass = {
                                                    bahaya: 'bg-red-100',
                                                    low: 'bg-orange-100',
                                                    cukup: 'bg-teal-100',
                                                    banyak: 'bg-green-100'
                                                }[condition];
                                                const conditionTextClass = {
                                                    bahaya: 'text-red-700',
                                                    low: 'text-orange-700',
                                                    cukup: 'text-teal-700',
                                                    banyak: 'text-green-700'
                                                }[condition];

                                                return (
                                                    <tr key={item.id} className={rowBgClass}>
                                                        <td className="py-1 px-2 text-gray-900">{item.name}</td>
                                                        <td className={`py-1 px-2 text-center font-bold uppercase ${conditionTextClass}`}>
                                                            {condition}
                                                        </td>
                                                        <td className="py-1 px-2 text-right text-gray-900">{item.quantity}</td>
                                                        <td className="py-1 px-2 text-center text-gray-700">{item.unit}</td>
                                                        <td className="py-1 px-2 text-right text-gray-700">{item.minStock}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="shrink-0 p-5 border-t border-white/10 flex gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={!pdfBlob || isGenerating}
                        className="flex-1 bg-white text-black rounded-xl py-3.5 px-4 flex items-center justify-center gap-2.5 font-bold text-sm hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} />
                        <span>Download PDF</span>
                    </button>
                    <button
                        onClick={handleWhatsAppShare}
                        disabled={isGenerating}
                        className="flex-1 bg-emerald-600 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2.5 font-bold text-sm hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MessageCircle size={18} />
                        <span>Kirim via WhatsApp</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
