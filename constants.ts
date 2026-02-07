import { StockItem, Supplier } from './types';

// Helper to generate a somewhat relevant image URL based on ID to keep it consistent
const getImg = (id: number, type: string) => `https://picsum.photos/seed/${type}${id}/200/200`;

// Mock Suppliers
export const SUPPLIERS: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'PT Indofood Sukses Makmur',
    alias: 'Indofood',
    contacts: [
      { id: 'c1', type: 'whatsapp', value: '+6281234567890' },
      { id: 'c2', type: 'email', value: 'order@indofood.co.id' }
    ],
    preferredContact: 'c1',
    address: 'Jl. Jenderal Sudirman Kav. 76-78, Jakarta',
    messageTemplate: 'Halo, kami dari Warkop ingin memesan stok berikut:'
  },
  {
    id: 'supplier-2',
    name: 'CV Teh Nusantara',
    alias: 'Teh Nusantara',
    contacts: [
      { id: 'c3', type: 'whatsapp', value: '+6287654321098' }
    ],
    preferredContact: 'c3',
    address: 'Jl. Raya Puncak No. 123, Bogor',
    messageTemplate: 'Selamat pagi, kami ingin order teh berikut:'
  },
  {
    id: 'supplier-3',
    name: 'Kopi Jaya Abadi',
    alias: 'Kopi Jaya',
    contacts: [
      { id: 'c4', type: 'whatsapp', value: '+6289876543210' },
      { id: 'c5', type: 'email', value: 'sales@kopijaya.com' }
    ],
    preferredContact: 'c4',
    address: 'Jl. Kopi Raya No. 45, Surabaya',
    messageTemplate: 'Hai, mau pesan kopi dong:'
  },
  {
    id: 'supplier-4',
    name: 'PT Minuman Segar Indonesia',
    alias: 'MSI',
    contacts: [
      { id: 'c6', type: 'whatsapp', value: '+6281122334455' }
    ],
    preferredContact: 'c6',
    address: 'Jl. Beverage No. 88, Bandung',
    messageTemplate: 'Order minuman untuk Warkop:'
  }
];

export const WARKOP_ITEMS: StockItem[] = [
  {
    id: 1,
    name: "Indomie Ayam Bawang",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(1, 'noodle'),
    category: 'Mie Instan',
    minStock: 10,
    supplierId: 'supplier-1'
  },
  {
    id: 2,
    name: "Indomie Soto",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(2, 'noodle'),
    category: 'Mie Instan',
    minStock: 10,
    supplierId: 'supplier-1'
  },
  {
    id: 3,
    name: "Blackcurrant (Ahmad Tea)",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(3, 'tea'),
    category: 'Teh',
    minStock: 15,
    supplierId: 'supplier-2'
  },
  {
    id: 4,
    name: "Extra Joss Susu (JOSU)",
    quantity: 0,
    unit: "Cup",
    imageUrl: getImg(4, 'energy'),
    category: 'Minuman Segar',
    minStock: 20,
    supplierId: 'supplier-4'
  },
  {
    id: 5,
    name: "Earl Grey (Dilmah)",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(5, 'tea'),
    category: 'Teh',
    minStock: 5,
    supplierId: 'supplier-2'
  },
  {
    id: 6,
    name: "Kapal Api Kopi Hitam",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(6, 'coffee'),
    category: 'Kopi',
    minStock: 24,
    supplierId: 'supplier-3'
  },
  {
    id: 7,
    name: "Indomie Kuah Rasa Soto Medan",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(7, 'noodle'),
    category: 'Mie Instan',
    minStock: 10,
    supplierId: 'supplier-1'
  },
  {
    id: 8,
    name: "Indomie Kuah Rasa Kaldu Ayam",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(8, 'noodle'),
    category: 'Mie Instan',
    minStock: 10,
    supplierId: 'supplier-1'
  },
  {
    id: 9,
    name: "Indocafe Coffee Mix",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(9, 'coffee'),
    category: 'Kopi',
    minStock: 50,
    supplierId: 'supplier-3'
  },
  {
    id: 10,
    name: "Indomie Goreng Rasa Rendang",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(10, 'noodle'),
    category: 'Mie Instan',
    minStock: 15,
    supplierId: 'supplier-1'
  },
  {
    id: 11,
    name: "Nutrisari Milky Orange",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(11, 'orange'),
    category: 'Minuman Segar',
    minStock: 20,
    supplierId: 'supplier-4'
  },
  {
    id: 12,
    name: "Earl Grey (Ahmad Tea)",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(12, 'tea'),
    category: 'Teh',
    minStock: 5,
    supplierId: 'supplier-2'
  }
];