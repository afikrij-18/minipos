"use client";
import { notFound, useParams } from "next/navigation";
import { getTransactionsById } from "@/services/transaction.service";

import { useAuth } from "@/contexts/auth-context";
import { use, useEffect, useRef, useState } from "react";
import { SaleTransaction } from "@/types/transaction";
import { CheckCircle2, Link, Printer } from "lucide-react";
import { formatDate } from "@/utils/date";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/utils/currency";
import { useReactToPrint } from "react-to-print";

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<SaleTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref untuk menunjuk area yang akan dicetak
  const printRef = useRef<HTMLDivElement>(null);

  // Hook print dari react-to-print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${transaction?.invoiceNumber || "Transaksi"}`,
  });

  useEffect(() => {
    if (!user) return;
    getTransactionsById(user?.uid, params.id).then((data) => {
      setTransaction(data);
      setLoading(false);
    });
  }, [user, params.id]);

  console.log(transaction);

  if (loading)
    return <div className="rounded-2xl bg-white p-6">Memuat transaksi...</div>;
  if (!transaction)
    return (
      <div className="rounded-2xl bg-white p-6"> Transaksi tidak ditemukan</div>
    );

  return (
    
      <div className="mx-auto max-w-3xl">
        {/* Tombol Aksi diluar area cetak (Disembunyikan saat print menggunakan class print:hidden) */}
        <div className="mb-5 flex items-center justify-between print:hidden">
            <Button onClick={() => handlePrint()} className="flex items-center gap-2">
              <Printer size={16} />
              Cetak Invoice
            </Button>
        </div>
        {/* Area struk yang akan diprint, yang ada di dalam container div tersebut */}
        <div ref={printRef} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flext-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:item-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Transaksi Berhasil
                </div>
                <h1 className="mt-1 text-2xl font-black">
                  {transaction.invoiceNumber}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>
            <Link href="/transactions/new">
              <Button>Transaksi Baru</Button>
            </Link>
          </div>
          <div className="py-6">
            <h2 className="mb-4 font-black">Detail Produk</h2>
            <div className="grid gap-3">
              {transaction.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4"
                >
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {item.sku} . {item.quantity} x{" "}
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="font-black">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-100 pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Metode Pembayaran</span>
              <strong className="uppercase">{transaction.paymentMethod}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <strong className="uppercase">{transaction.total}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dibayar</span>
              <strong className="uppercase">
                {formatCurrency(transaction.paymentAmount)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Kembalian</span>
              <strong className="uppercase">
                {formatCurrency(transaction.change)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    
  );
}
