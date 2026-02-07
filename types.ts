export interface StockItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  imageUrl: string;
  category: string;
  minStock: number;
  supplierId: string;  // Link to supplier
}

export interface StockCardProps {
  item: StockItem;
  onUpdate: (id: number, quantity: number) => void;
}

export interface InvoiceItem {
  name: string;
  qty: number;
  unit: string;
  price: number;
}

export interface Invoice {
  id: string;
  supplierName: string;
  date: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: {
    itemsReceived: boolean;
    paymentSent: boolean;
  };
  imageUrl?: string; // Preview of the receipt
  createdAt: number;
}

export type StockCondition = 'bahaya' | 'low' | 'cukup' | 'banyak';

// Supplier types
export interface SupplierContact {
  id: string;
  type: 'whatsapp' | 'email';
  value: string;
}

export interface Supplier {
  id: string;
  name: string;
  alias?: string;
  contacts: SupplierContact[];
  messageTemplate?: string;
  preferredContact?: string;
  address?: string;
  notes?: string;
}