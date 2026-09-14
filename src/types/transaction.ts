import { Timestamp } from "firebase/firestore";

export type SaleTransaction = {
  changeAmount : number;
  id: string;
  invoiceNumber: string;
  items: TransactionItem[];
  total: number;
  discount?: number;
  paymentAmount: number;
  change: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
};

export type CartItem = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  stock: number;
}

export type TransactionItem = Omit<CartItem, "stock">;

export type PaymentMethod = 
| "cash"
| "qris"
| "transfer";
