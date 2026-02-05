export interface StockItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  imageUrl: string;
  category: string;
  minStock: number;
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