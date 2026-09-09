export type TransactionItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type PaymentMethod = 
| "cash"
| "qris"
| "transfer";

export type Transaction = {
  id: string;
  invoiceNumber: string;
  items: TransactionItem[];
  total: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
};