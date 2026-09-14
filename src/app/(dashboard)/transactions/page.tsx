"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTransactions } from "@/services/transaction.service";
import type { SaleTransaction } from "@/types/transaction";
import { formatCurrency} from "@/utils/currency";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/auth-context";
import { formatDate } from "@/utils/date";

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setTransactions(await getTransactions(user.uid));
    } finally {
      setLoading(false);
    }
  }, [user]);


useEffect(() => { void load(); }, [load]);

return (
  <div>
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-bold text-indigo-600">TRANSAKSI</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Riwayat Transaksi</h1>
        <p className="mt-2 text-sm text-slate-500">Semua transaksi yang berhasil disimpan.</p>
      </div>
      <Link href="/transactions/new"><Button><Plus size={18} /> Transaksi Baru</Button></Link>
    </div>

    {loading && <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Memuat transaksi...</div>}
    {!loading && transactions.length === 0 && (
      <EmptyState
        title="Belum ada transaksi"
        description="Buat transaksi pertama melalui halaman Kasir / POS." />
    )}
    {!loading && transactions.length > 0 && (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-5 py-4">Invoice</th>
            <th className="px-5 py-4">Tanggal</th>
            <th className="px-5 py-4">Item</th>
            <th className="px-5 py-4">Metode</th>
            <th className="px-5 py-4 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((trx) => (
            <tr key={trx.id} className="hover:bg-slate-50">
              <td className="px-5 py-4">
                <Link href={`/transactions/${trx.id}`} className="font-black text-indigo-600 hover:underline">
                  {trx.invoiceNumber}
                </Link>
              </td>
              <td className="px-5 py-4 text-slate-500">{formatDate(trx.createdAt)}</td>
              <td className="px-5 py-4 text-slate-600">{trx.items.length}</td>
              <td className="px-5 py-4 uppercase text-slate-700">{trx.paymentMethod}</td>
              <td className="px-5 py-4 text-right font-semibold text-slate-700">{formatCurrency(trx.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
  </div>
)
}