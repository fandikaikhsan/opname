import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, Save, Sparkles, Plus, Trash2 } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Invoice, InvoiceItem } from '../types';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState<'select' | 'processing' | 'edit'>('select');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Partial<Invoice>>({});
  // Local state for formatted amount string to handle user input comfortably
  const [displayAmount, setDisplayAmount] = useState(""); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (parsedData.totalAmount !== undefined) {
      setDisplayAmount(parsedData.totalAmount.toLocaleString('id-ID'));
    }
  }, [parsedData.totalAmount]);

  const processImage = async (file: File) => {
    setStep('processing');
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPreviewUrl(base64String);
      
      const base64Data = base64String.split(',')[1];
      // Default to jpeg if type is missing/empty
      const mimeType = file.type || 'image/jpeg';

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { mimeType: mimeType, data: base64Data } },
              { text: "Analyze this receipt. Return a JSON with: supplierName, date (YYYY-MM-DD), totalAmount (number), and items (array of name, qty, unit, price). If info is missing, use reasonable defaults or empty strings." }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                supplierName: { type: Type.STRING },
                date: { type: Type.STRING },
                totalAmount: { type: Type.NUMBER },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      qty: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                      price: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          }
        });

        const jsonText = response.text;
        if (jsonText) {
          const data = JSON.parse(jsonText);
          setParsedData({
            id: Date.now().toString(),
            supplierName: data.supplierName || 'Unknown Supplier',
            date: data.date || new Date().toISOString().split('T')[0],
            totalAmount: data.totalAmount || 0,
            items: data.items || [],
            imageUrl: base64String,
            status: { itemsReceived: false, paymentSent: false },
            createdAt: Date.now()
          });
          setStep('edit');
        } else {
           throw new Error("No data returned from AI");
        }
      } catch (error: any) {
        console.error("Gemini Error:", error);
        
        let errorMsg = "Gagal memproses gambar.";
        if (error instanceof Error) {
            errorMsg += `\nDetail: ${error.message}`;
        }
        
        alert(errorMsg + "\n\nSilakan isi data secara manual.");
        
        // Fallback to manual entry with the image
        setParsedData({
            id: Date.now().toString(),
            supplierName: '',
            date: new Date().toISOString().split('T')[0],
            totalAmount: 0,
            items: [],
            imageUrl: base64String,
            status: { itemsReceived: false, paymentSent: false },
            createdAt: Date.now()
        });
        setStep('edit');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters except for simplicity in this context (assuming IDR uses dots or commas, but here we just want digits to parse)
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const numVal = parseInt(rawVal, 10);
    
    if (!isNaN(numVal)) {
      setDisplayAmount(numVal.toLocaleString('id-ID'));
      setParsedData(prev => ({ ...prev, totalAmount: numVal }));
    } else {
      setDisplayAmount("");
      setParsedData(prev => ({ ...prev, totalAmount: 0 }));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...(parsedData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setParsedData(prev => ({ ...prev, items: newItems }));
  };

  const deleteItem = (index: number) => {
    const newItems = [...(parsedData.items || [])];
    newItems.splice(index, 1);
    setParsedData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setParsedData(prev => ({
      ...prev,
      items: [...(prev.items || []), { name: '', qty: 1, unit: 'pcs', price: 0 }]
    }));
  };

  const handleSave = () => {
    if (parsedData.supplierName) {
      onSave(parsedData as Invoice);
      handleClose();
    }
  };

  const handleClose = () => {
    setStep('select');
    setPreviewUrl(null);
    setParsedData({});
    setDisplayAmount("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />
      
      <div className="relative bg-gray-950 w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {step === 'select' && (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Tambah Invoice</h2>
            <p className="text-gray-400 mb-8 text-sm">Pilih metode input gambar struk/nota</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 active:scale-95 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Camera className="text-emerald-500" size={24} />
                </div>
                <span className="font-bold text-white">Ambil Foto</span>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/10 active:scale-95 transition-all"
              >
                 <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ImageIcon className="text-blue-500" size={24} />
                </div>
                <span className="font-bold text-white">Upload</span>
              </button>
            </div>

            {/* Hidden Inputs */}
            <input 
              type="file" 
              ref={cameraInputRef} 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
            
             <button onClick={handleClose} className="mt-8 text-sm text-gray-500 font-medium p-2">Batal</button>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
                <Sparkles className="relative text-emerald-400 animate-spin-slow" size={48} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Menganalisa Struk...</h3>
            <p className="text-gray-500 text-sm">AI sedang membaca data belanjaanmu.</p>
            {previewUrl && (
                <div className="mt-6 w-32 h-32 rounded-xl overflow-hidden border border-white/10 opacity-50">
                    <img src={previewUrl} className="w-full h-full object-cover" />
                </div>
            )}
          </div>
        )}

        {step === 'edit' && (
          <>
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gray-900/50">
                <h3 className="font-bold text-white">Konfirmasi Data</h3>
                <button onClick={handleClose}><X size={20} className="text-gray-400" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {previewUrl && (
                    <div className="h-40 w-full rounded-xl overflow-hidden border border-white/10 shrink-0 relative group">
                        <img src={previewUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                        <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">Foto Struk</span>
                    </div>
                )}

                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Supplier</label>
                    <input 
                        type="text" 
                        value={parsedData.supplierName} 
                        onChange={(e) => setParsedData({...parsedData, supplierName: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium appearance-none"
                        placeholder="Nama Toko / Supplier"
                    />
                </div>

                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Tanggal</label>
                    <input 
                        type="date" 
                        value={parsedData.date} 
                        onChange={(e) => setParsedData({...parsedData, date: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium text-sm appearance-none block min-w-0"
                    />
                </div>

                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 block">Total (Rp)</label>
                    <input 
                        type="text" 
                        value={displayAmount}
                        onChange={handleAmountChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none font-medium text-right appearance-none"
                        placeholder="0"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                         <label className="text-[10px] uppercase font-bold text-gray-500 block">Daftar Barang</label>
                         <button onClick={addItem} className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <Plus size={12} /> Tambah
                         </button>
                    </div>
                    <div className="space-y-3">
                        {parsedData.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-start group">
                                <div className="flex-1 space-y-1">
                                    <input 
                                        type="text" 
                                        value={item.name}
                                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500/50 outline-none"
                                        placeholder="Nama Barang"
                                    />
                                    <div className="flex gap-2">
                                        <div className="relative flex-1 max-w-[80px]">
                                             <input 
                                                type="number" 
                                                value={item.qty}
                                                onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))}
                                                className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500/50 outline-none"
                                            />
                                            <span className="absolute right-2 top-1.5 text-xs text-gray-500 pointer-events-none">Qty</span>
                                        </div>
                                         <div className="relative flex-1">
                                             <input 
                                                type="text" 
                                                value={item.unit}
                                                onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                                                className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500/50 outline-none"
                                                placeholder="Satuan (Pcs/Kg)"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => deleteItem(idx)}
                                    className="p-2 text-gray-600 hover:text-red-400 transition-colors mt-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-white/10 bg-gray-900/50">
                <button 
                    onClick={handleSave}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <Save size={18} />
                    <span>Simpan Data</span>
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScannerModal;