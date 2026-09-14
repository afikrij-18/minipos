import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type {
  TransactionItem,
  PaymentMethod,
  SaleTransaction,
  CartItem,
} from "@/types/transaction";
import { createInvoiceNumber } from "@/utils/invoice";


const transactionCollection = (uid: string) => {
  return collection(db, "users", uid, "transactions");
};

type CreateTransactionPayload = {
  items: TransactionItem[];
  total: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
};

type CheckoutInput = {
  items: CartItem [];
  paymentMethod: PaymentMethod;
  paymentAmount: number;
};

function generateInvoiceNumber() {
  return `TRX-${Date.now()}`;
}

export const createTransaction = async (
  uid: string,
  payload: CreateTransactionPayload,
) => {
  const changeAmount = payload.paidAmount - payload.total;

  const transactionRef = doc(transactionCollection(uid));

  await runTransaction(db, async (transaction) => {
    const products: {
      item: TransactionItem;
      ref: ReturnType<typeof doc>;
      stock: number;
      name: string;
    }[] = [];

    // READ PRODUCTS
    for (const item of payload.items) {
      const productRef = doc(db, "users", uid, "products", item.productId);

      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists()) {
        throw new Error(
          `Product "${item.name}" dengan ID "${item.productId}" tidak ditemukan`,
        );
      }

      const productData = productSnap.data();

      products.push({
        item,
        ref: productSnap.ref,
        stock: productData.stock ?? 0,
        name: productData.name ?? item.name,
      });
    }

    // UPDATE STOCK
    for (const product of products) {
      if (product.stock < product.item.quantity) {
        throw new Error(
          `Stock "${product.name}" tidak mencukupi. ` +
            `Tersedia: ${product.stock}, ` +
            `dibutuhkan: ${product.item.quantity}`,
        );
      }

      transaction.update(product.ref, {
        stock: product.stock - product.item.quantity,
      });
    }

    // CREATE TRANSACTION
    transaction.set(transactionRef, {
      invoiceNumber: generateInvoiceNumber(),
      items: payload.items,
      total: payload.total,
      paidAmount: payload.paidAmount,
      changeAmount,
      paymentMethod: payload.paymentMethod,
      createdAt: serverTimestamp(),
    });
  });

  return transactionRef.id;
};

// Tambahkan return type Promise<Transaction[]>
export async function getTransactions(uid: string): Promise<SaleTransaction[]> {
  const q = query(transactionCollection(uid), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => {
    const data = item.data();

    return {
      id: item.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as SaleTransaction;
  });
}

// Tambahkan return type Promise<Transaction | null>
export async function getTransactionsById(
  uid: string,
  transactionId: string,
): Promise<SaleTransaction | null> {
  const docRef = doc(db, "users", uid, "transactions", transactionId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as SaleTransaction;
}

export async function checkout(uid: string, input: CheckoutInput) {
  if (input.items.length === 0) throw new Error ("Keranjang masih kosong.");

  const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (input.paymentMethod === "cash" && input.paymentAmount < total) {
    throw new Error("Uang pembayaran masih kurang");
  }

  const invoiceNumber = createInvoiceNumber();
  const transactionRef = doc(collection(db, "users", uid, "transactions"));

  await runTransaction(db,async (firestoreTransaction) => {
    const productSnapshots= await Promise.all(
      input.items.map((item) =>
      firestoreTransaction.get(doc(db,"users", uid, "products", item.productId))
      )
    );

    productSnapshots.forEach((snapshot, index) => {
      const cartItem = input.items[index];
      if (!snapshot.exists()) throw new Error(`Produk ${cartItem.name} tidak ditemukan. `);
      const currentStock = Number (snapshot.data().stock ?? 0);
      if (currentStock < cartItem.quantity) {
        throw new Error (`Stok ${cartItem.name} tidak mencukupi.`);
      }
    });

    productSnapshots.forEach ((snapshot, index) => {
      const cartItem = input.items[index];
      const currentStock = Number (snapshot.data()?.stock ?? 0);
      firestoreTransaction.update(snapshot.ref, {
        stock: currentStock - cartItem.quantity,
        updateAt: serverTimestamp(),
      });
    });
    
    const cleanItems = input.items.map(({ productId, name, sku, price, quantity }) => ({
      productId,
      name,
      sku,
      price,
      quantity,
    }));

    firestoreTransaction.set(transactionRef, {
      invoiceNumber,
      items: cleanItems,
      subtotal: total,
      total,
      paymentMethod: input.paymentMethod,
      paymentAmount: input.paymentAmount,
      change: input.paymentMethod === "cash" ? input.paymentAmount - total : 0,
      createdAt: serverTimestamp(),
    });
  });

  return { transactionId: transactionRef.id, invoiceNumber, total};
 
}

