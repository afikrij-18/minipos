import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { TransactionItem, PaymentMethod } from "@/types/transaction";

const transactionCollection = collection(db, "transactions");

type CreateTransactionPayload = {
  items: TransactionItem[];
  total: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
};

function generateInvoiceNumber() {
  return `TRX-${Date.now()}`;
}

export async function createTransaction(payload: CreateTransactionPayload) {
  const changeAmount = payload.paidAmount - payload.total;

  const docRef = await addDoc(transactionCollection, {
    invoiceNumber: generateInvoiceNumber(),
    items: payload.items,
    total: payload.total,
    paidAmount: payload.paidAmount,
    changeAmount,
    paymentMethod: payload.paymentMethod,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getTransactions() {
  const q = query(transactionCollection, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => {
    const data = item.data();

    return {
      id: item.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    };
  });
}

export async function getTransactionsById(id: string) {
  const docRef = doc(db, "transactions", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  };
}
