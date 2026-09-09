"use client";
import React, { useEffect, useState } from "react";
import { getTransactions } from "@/services/transaction.service";
import { Transaction } from "@/types/transaction";
import { formatCurrency, formatDate } from "@/utils/format";
import Link from "next/link";
import PrintButton from "@/components/transactions/print-button";

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getTransactions();
      setTransactions(data as Transaction[]);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div>
      <table className="w-full text-left text-md">
        <thead className="border-b-2">
          <tr>
            <th>ID Transaksi</th>
            <th>Tanggal</th>
            <th>Total</th>
            <th>Metode Pembayaran</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr className="border-b" key={transaction.id}>
              <td>{transaction.invoiceNumber}</td>
              <td>{formatDate(transaction.createdAt)}</td>
              <td>{formatCurrency(transaction.total)}</td>
              <td className="text-center">{transaction.paymentMethod}</td>
              <td>
                <Link href={"/transactions/" + transaction.id}><PrintButton />
                  
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
