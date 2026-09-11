"use client";
import { notFound, useParams } from "next/navigation";
import { getTransactionsById } from "@/services/transaction.service";
import { formatRupiah } from "@/utils/format";
import PrintButton from "@/components/transactions/print-button";
import { useAuth } from "@/contexts/auth-context";
import { use } from "react";



export default  function TransactionDetailPage() {
  const params = useParams<{id: string}>();
  const { user } = useAuth();

  if (!params.id) {
    notFound();
  }

  if (!user) return;

  const transaction = getTransactionsById(user.uid, params.id);

  if (!transaction) {
    notFound();
  }

  // Menghitung subtotal dari seluruh barang
  const subtotal = transaction.items?.reduce(
    (acc: number, item: any) => acc + (item.subtotal || 0),
    0
  );

  // Menghitung diskon (jika disimpan terpisah, gunakan transaction.discount; jika tidak, hitung selisihnya)
  const discount =
    transaction.discount ?? (subtotal - transaction.total > 0 ? subtotal - transaction.total : 0);

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Tombol Aksi (disembunyikan saat dicetak) */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold text-slate-800">Detail Transaksi</h1>
        <PrintButton />
      </div>

      {/* Tampilan Struk / Invoice */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
        {/* Header Invoice */}
        <div className="border-b pb-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">FULLSTACK POS</h2>
          <p className="text-sm text-slate-500">Struk Pembayaran Resmi</p>
        </div>

        {/* Informasi Transaksi */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-slate-500">No. Invoice:</p>
            <p className="font-semibold text-slate-800">
              {transaction.invoiceNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Tanggal:</p>
            <p className="font-semibold text-slate-800">
              {transaction.createdAt
                ? new Date(transaction.createdAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "-"}
            </p>
          </div>
          <div className="mt-2">
            <p className="text-slate-500">Metode Pembayaran:</p>
            <p className="font-semibold uppercase text-slate-800">
              {transaction.paymentMethod}
            </p>
          </div>
        </div>

        {/* Daftar Barang / Items */}
        <div className="mt-6 border-t pt-4">
          <h3 className="mb-3 text-sm font-bold text-slate-700">
            Rincian Item
          </h3>
          <div className="space-y-3">
            {transaction.items?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {item.productName || item.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatRupiah(item.price)} x {item.quantity || item.qty}
                  </p>
                </div>
                <span className="font-semibold text-slate-800">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ringkasan Pembayaran */}
        <div className="mt-6 space-y-2 border-t pt-4 text-sm">
          {/* Subtotal */}
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>

          {/* Diskon (Ditampilkan jika ada potongan harga) */}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Diskon</span>
              <span>-{formatRupiah(discount)}</span>
            </div>
          )}

          {/* Total Bayar */}
          <div className="flex justify-between font-bold text-base text-slate-900 border-t pt-2 mt-2">
            <span>Total Bayar</span>
            <span>{formatRupiah(transaction.total)}</span>
          </div>

          {transaction.paidAmount > 0 && (
            <>
              <div className="flex justify-between text-slate-600">
                <span>Jumlah Dibayar</span>
                <span>{formatRupiah(transaction.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Kembalian</span>
                <span>{formatRupiah(transaction.changeAmount || 0)}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Invoice */}
        <div className="mt-8 border-t pt-4 text-center text-xs text-slate-400">
          <p>Terima kasih telah berbelanja!</p>
          <p>Simpan struk ini sebagai bukti pembayaran yang sah.</p>
        </div>
      </div>
    </div>
  );
}