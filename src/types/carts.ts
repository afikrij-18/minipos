export type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
};

export type PaymentMethod = "cash" | "transfer" | "qris" ;