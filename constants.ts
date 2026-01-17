import { StockItem } from './types';

// Helper to generate a somewhat relevant image URL based on ID to keep it consistent
const getImg = (id: number, type: string) => `https://picsum.photos/seed/${type}${id}/200/200`;

export const WARKOP_ITEMS: StockItem[] = [
  {
    id: 1,
    name: "Indomie Ayam Bawang",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(1, 'noodle'),
    category: 'Food',
    minStock: 10
  },
  {
    id: 2,
    name: "Indomie Soto",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(2, 'noodle'),
    category: 'Food',
    minStock: 10
  },
  {
    id: 3,
    name: "Blackcurrant (Ahmad Tea)",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(3, 'tea'),
    category: 'Beverage',
    minStock: 15
  },
  {
    id: 4,
    name: "Extra Joss Susu (JOSU)",
    quantity: 0,
    unit: "Cup",
    imageUrl: getImg(4, 'energy'),
    category: 'Beverage',
    minStock: 20
  },
  {
    id: 5,
    name: "Earl Grey (Dilmah)",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(5, 'tea'),
    category: 'Beverage',
    minStock: 5
  },
  {
    id: 6,
    name: "Kapal Api Kopi Hitam",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(6, 'coffee'),
    category: 'Beverage',
    minStock: 24
  },
  {
    id: 7,
    name: "Indomie Kuah Rasa Soto Medan",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(7, 'noodle'),
    category: 'Food',
    minStock: 10
  },
  {
    id: 8,
    name: "Indomie Kuah Rasa Kaldu Ayam",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(8, 'noodle'),
    category: 'Food',
    minStock: 10
  },
  {
    id: 9,
    name: "Indocafe Coffee Mix",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(9, 'coffee'),
    category: 'Beverage',
    minStock: 50
  },
  {
    id: 10,
    name: "Indomie Goreng Rasa Rendang",
    quantity: 0,
    unit: "Bks",
    imageUrl: getImg(10, 'noodle'),
    category: 'Food',
    minStock: 15
  },
  {
    id: 11,
    name: "Nutrisari Milky Orange",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(11, 'orange'),
    category: 'Beverage',
    minStock: 20
  },
  {
    id: 12,
    name: "Earl Grey (Ahmad Tea)",
    quantity: 0,
    unit: "Sachet",
    imageUrl: getImg(12, 'tea'),
    category: 'Beverage',
    minStock: 5
  }
];