/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { getProducts } from "@/services/product.service";
import { checkout } from "@/services/transaction.service";
import type { Product } from "@/types/product";
import type { CartItem, PaymentMethod } from "@/types/transaction";
import { formatCurrency } from "@/utils/currency";

export default function NewTransactionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setProducts(await getProducts(user.uid));
    } catch {
      setError("Gagal mengambil produk.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword),
    );
  }, [products, search]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const change =
    paymentMethod === "cash" ? Math.max(paymentAmount - total, 0) : 0;

  function addToCart(product: Product) {
    if (product.stock <= 0) return;
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return current;
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(
                  item.stock,
                  Math.max(0, item.quantity + delta),
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId: string) {
    setCart((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }

  async function handleCheckout() {
    if (!user) return;
    setError("");

    if (cart.length === 0) return setError("Keranjang masih kosong.");
    if (paymentMethod === "cash" && paymentAmount < total)
      return setError("Uang pembayaran masih kurang");

    try {
      setSubmitting(true);
      const result = await checkout(user.uid, {
        items: cart,
        paymentMethod,
        paymentAmount: paymentMethod === "cash" ? paymentAmount : total,
      });
      router.push(`/transactions/${result.transactionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaksi gagal disimpan");
      await loadProducts();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-bold text-indigo-600"> POINT OF SALE</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">
          Transaksi Baru
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Pilih produk, atur jumlah, lalu selesaikan pembayaran
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <section className="min-w-0">
          <div className="mb-4 max-w-md">
            <Input
              placeholder="Cari nama atau SKU.."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="rounded-2xl bg-white p-8 text-slate-500">
              Memuat produk ...
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="rounded-2xl border-slate-200 bg-white p-5 text-left shadow-sm transition hover:translate-y-0.5 hover:border-indigo-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-slate-900">
                        {product.name}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-400">
                        {product.sku}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold ${product.stock <= 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
                    >
                      {product.stock}
                    </span>
                  </div>
                  <div className="mt-5 text-lg font-black text-indigo-600">
                    {formatCurrency(product.price)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl bg-slate-950 p-5 text-white shadow-xl xl:sticky xl:top-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-600">
              <ShoppingCart size={20} />
            </div>
            <div>
              <div className="font-black">Keranjang</div>
              <div className="text-xs text-slate-400">
                {cart.length} jenis produk
              </div>
            </div>
          </div>
          <div className="grid max-h-72 gap-3 overflow-y-auto pr-1">
            {cart.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
                Belum ada produk.
              </div>
            )}
            {cart.map((item) => (
              <div
                key={item.productId}
                className="rounded-2xl bg-slate-900 p-4"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {formatCurrency(item.price)} / item
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="grid size-8 place-items-center rounded-lg bg-slate-800"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="min-w-6 text-center font-black">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      disabled={item.quantity >= item.stock}
                      className="grid size-8 place-items-center rounded-lg bg-slate-800 disabled:opacity-30"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <div className="font-black">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="my-5 border-t border-slate-800" />
          <div className="flex items-end justify-between">
            <span className="text-sm text-slate-400">Total</span>
            <span className="text-2xl font-black">{formatCurrency(total)}</span>
          </div>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-2 text-sm font-bold">
              Metode Pembayaran
              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="min-h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 text-white outline-none"
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
                <option value="qris">QRIS</option>
              </select>
            </label>

            {paymentMethod === "cash" && (
              <label className="grid gap-2 text-sm font-bold">
                Uang Diterima
                <input
                  type="number"
                  min="0"
                  value={paymentAmount || ""}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="min-h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 text-white outline-none"
                />
              </label>
            )}

            <div className="flex justify-between rounded-xl bg-slate-900 p-3 text-sm">
              <span className="text-slate-400">Kembalian</span>
              <strong>{formatCurrency(change)}</strong>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-950 p-3 text-sm font-semibold text-rose-200">
                {error}
              </div>
            )}
            <Button
              onClick={() => void handleCheckout()}
              disabled={submitting || cart.length === 0}
              className="w-full"
            >
              {submitting ? "Menyimpan..." : `Bayar ${formatCurrency(total)}`}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
