"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTransactions } from "@/services/transaction.service";
import type { Transaction } from "@/types/transaction";
import { formatCurrency, formatDate } from "@/utils/format";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function TransactionPage() {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");
      const data = await getTransactions();
      setTransactions(data as Transaction[]);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat riwayat transaksi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.invoiceNumber?.toLowerCase().includes(keyword) ||
        tx.paymentMethod?.toLowerCase().includes(keyword)
    );
  }, [transactions, search]);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        Memuat data transaksi...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-600">OVERVIEW</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Seluruh daftar transaksi yang telah selesai.
          </p>
        </div>

        <Link href="/transactions/new">
          <Button className="w-full sm:w-auto">
            <Plus size={18} />
            Transaksi Baru
          </Button>
        </Link>
      </div>

      {/* Input Pencarian */}
      <div className="mb-5 max-w-md">
        <Input
          placeholder="Cari No. Invoice atau metode pembayaran..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-3"
        />
      </div>

      {/* Tabel Transaksi */}
      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">No. Invoice</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4 text-center">Metode</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((transaction) => {
                  return (
                    <tr
                      key={transaction.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {transaction.invoiceNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatCurrency(transaction.total)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                          {transaction.paymentMethod}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={"/transactions/" + transaction.id}
                            className="rounded-lg border px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 duration-200"
                          >
                            <div className="flex items-center gap-1.5">
                              <Eye size={16} />
                              Detail
                            </div>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* State Jika Belum Ada Data Transaksi */}
      {transactions.length === 0 && (
        <EmptyState
          title="Belum ada transaksi"
          description="Buat transaksi baru untuk mencatat penjualan di POS."
        />
      )}

      {/* State Jika Pencarian Tidak Ditemukan */}
      {transactions.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm border">
          <Search className="mx-auto mb-2 text-slate-400" />
          Transaksi tidak ditemukan.
        </div>
      )}
    </div>
  );
}