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
import type { TransactionItem, PaymentMethod, Transaction } from "@/types/transaction";
// import { DEMO_USER_ID } from "./product.service";

const transactionCollection = (uid:string) => {
  return collection(db, "users", uid, "transactions");
  
} 

type CreateTransactionPayload = {
  items: TransactionItem[];
  total: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
};

function generateInvoiceNumber() {
  return `TRX-${Date.now()}`;
}

export const createTransaction = async (uid: string, payload: CreateTransactionPayload,
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
      const productRef = doc(
        db,
        "users",
        uid,
        "products",
        item.productId
      );

      const productSnap = await transaction.get(productRef);

      if (!productSnap.exists()) {
        throw new Error(
          `Product "${item.productName}" dengan ID "${item.productId}" tidak ditemukan`
        );
      }

      const productData = productSnap.data();

      products.push({
        item,
        ref: productSnap.ref,
        stock: productData.stock ?? 0,
        name: productData.name ?? item.productName,
      });
    }

    // UPDATE STOCK
    for (const product of products) {
      if (product.stock < product.item.quantity) {
        throw new Error(
          `Stock "${product.name}" tidak mencukupi. ` +
          `Tersedia: ${product.stock}, ` +
          `dibutuhkan: ${product.item.quantity}`
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
export async function getTransactions(uid: string): Promise<Transaction[]> {
  const q = query(transactionCollection(uid), orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => {
    const data = item.data();

    return {
      id: item.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as Transaction;
  });
}

// Tambahkan return type Promise<Transaction | null>
export async function getTransactionsById(uid: string, transactionId: string): Promise<Transaction | null> {
  const docRef = doc(db, "users", uid, "transactions",transactionId );
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  } as Transaction;
}