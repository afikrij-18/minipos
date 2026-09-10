"use client";

import {
  Boxes,
  CircleDollarSign,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/services/product.service";
import { getTransactions } from "@/services/transaction.service";
import { formatCurrency } from "@/utils/currency";

import type { Product } from "@/types/product";
import type { Transaction } from "@/types/transaction";

const LOW_STOCK_LIMIT = 5;

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pilih transaksi hari ini
  const todayTransactions = useMemo(() => {
    return transactions.filter((transaction) => isToday(transaction.createdAt));
  }, [transactions]);

  // Hitung omzet hari ini
  const todayRevenue = useMemo(() => {
    return todayTransactions.reduce(
      (total, transaction) => total + transaction.total,
      0,
    );
  }, [todayTransactions]);

  const averageTransaction = todayTransactions.length
    ? todayRevenue / todayTransactions.length
    : 0;

  // Deteksi stok menipis
  const lowStockProducts = useMemo(() => {
    return products.filter((product) => product.stock <= LOW_STOCK_LIMIT);
  }, [products]);
  const totalLowStock = lowStockProducts.length;

  // Urutkan produk terlaris hari ini
  const bestSellingProducts = useMemo(() => {
    const summary: Record<string, number> = {};
    todayTransactions.forEach(({ items }) => {
      items.forEach(({ productName, quantity }) => {
        summary[productName] = (summary[productName] || 0) + quantity;
      });
    });
    return Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [todayTransactions]);

  const latestTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime(),
    );
  }, [transactions]);

  const maxBestSellingQuantity = useMemo(() => {
    if (bestSellingProducts.length === 0) return 1;
    return Math.max(...bestSellingProducts.map(([_, quantity]) => quantity));
  }, [bestSellingProducts]);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      const [productData, transactionData] = await Promise.all([
        getProducts(),
        getTransactions(),
      ]);
      setProducts(productData);
      setTransactions(transactionData as Transaction[]);
    } catch {
      setError("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }

  function toDate(value: Date | { toDate: () => Date }) {
    return value instanceof Date ? value : value.toDate();
  }

  function isToday(value: Date | { toDate: () => Date }) {
    const date = toDate(value);
    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const stats = [
    {
      label: "Total Produk",
      value: products.length,
      icon: Boxes,
    },
    {
      label: "Transaksi Hari ini",
      value: todayTransactions.length,
      icon: ReceiptText,
    },
    {
      label: "Omzet hari ini",
      value: formatCurrency(todayRevenue),
      icon: CircleDollarSign,
    },
    {
      label: "Stok Menipis",
      value: totalLowStock,
      icon: TriangleAlert,
    },
  ];

  return (
    <div className="">
      <div className="mb-7">
        <p className="text-sm font-bold text-indigo-600">OVERVIEW</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">
          Ringkasan aktivitas MiniPOS hari ini.
        </p>
      </div>

      {/* Grid Statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-4">
        {stats.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Icon size={19} />
              </div>

              <div className="mt-5 text-sm font-semibold text-slate-500">
                {card.label}
              </div>

              <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grafik 5 Produk Teratas */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm mb-4">
        <h2 className="text-lg text-slate-800 font-semibold mb-4">
          Produk Terlaris Hari Ini
        </h2>

        {bestSellingProducts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Belum ada data penjualan hari ini.
          </p>
        ) : (
          <div className="space-y-3.5">
            {bestSellingProducts.map(([name, quantity], index) => {
              const percentage = (quantity / maxBestSellingQuantity) * 100;
              const barColors = [
                "bg-indigo-600",
                "bg-violet-600",
                "bg-sky-600",
                "bg-emerald-600",
                "bg-amber-600",
              ];

              const currentColor = barColors[index % barColors.length];

              return (
                <div key={name} className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">
                        0{index + 1}
                      </span>
                      {name}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {quantity}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        terjual
                      </span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${currentColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Stok Menipis */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm mb-4">
        <h2 className="text-lg text-black font-semibold">Stok Menipis</h2>
        {lowStockProducts.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Semua stok masih aman.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex justify-between rounded-xl bg-amber-100 p-3"
              >
                <span className="font-semibold text-black">{product.name}</span>
                <span className="text-sm font-bold text-amber-700">
                  Stock {product.stock}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Rata-rata Transaksi */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm mb-4">
        <h2 className="text-lg text-black font-semibold">
          Rata-rata transaksi
        </h2>
        {todayTransactions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{formatCurrency(0)}</p>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(averageTransaction)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Dari total {todayTransactions.length} transaksi hari ini.
            </p>
          </div>
        )}
      </section>

      {/* Transaksi Terbaru */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm mb-4">
        <h2 className="text-lg text-slate-800 font-semibold mb-4">
          Transaksi Terbaru
        </h2>

        {latestTransactions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Belum ada transaksi hari ini.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {latestTransactions.slice(0, 5).map((transaction) => {
              const transactionDate = toDate(transaction.createdAt);

              // Menghitung subtotal items
              const subtotal = transaction.items?.reduce(
                (acc, item) => acc + (item.subtotal || 0),
                0
              ) || 0;

              // Ambil nilai diskon dari data atau selisih subtotal dengan total
              const txDiscount = (transaction as any).discount ?? 0;
              const discount =
                txDiscount > 0
                  ? txDiscount
                  : subtotal - transaction.total > 0
                  ? subtotal - transaction.total
                  : 0;

              return (
                <details
                  key={transaction.id}
                  className="group rounded-xl bg-slate-50 p-3 transition-all duration-200 open:bg-slate-100/80 border border-transparent open:border-slate-200 [&::-webkit-details-marker]:hidden"
                >
                  {/* Header Card */}
                  <summary className="flex items-center justify-between cursor-pointer select-none">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {formatCurrency(transaction.total)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {transactionDate.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                        Selesai
                      </span>
                      <span className="text-xs text-slate-400 transition-transform duration-200 group-open:rotate-180 inline-block">
                        ▼
                      </span>
                    </div>
                  </summary>

                  {/* Isi Dropdown: Daftar Produk & Ringkasan Diskon */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Detail Produk:
                    </p>
                    {transaction.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-slate-700">
                          {item.productName}{" "}
                          <span className="text-xs text-slate-400">
                            ({item.quantity}x)
                          </span>
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}

                    {/* Menampilkan Rincian Diskon jika Ada */}
                    {discount > 0 && (
                      <div className="pt-2 mt-2 border-t border-slate-200/40 flex justify-between items-center text-xs text-emerald-600 font-medium">
                        <span>Diskon Transaksi</span>
                        <span>-{formatCurrency(discount)}</span>
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}