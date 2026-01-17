export interface StockItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  imageUrl: string;
  category: 'Food' | 'Beverage';
  minStock: number;
}

export interface StockCardProps {
  item: StockItem;
  onUpdate: (id: number, quantity: number) => void;
}