"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { useRouter } from "next/navigation";
import { createTransaction } from "@/services/transaction.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";
import type { CartItem, PaymentMethod } from "@/types/carts";
import { formatRupiah } from "@/utils/format";
import { TransactionItem } from "@/types/transaction";
import { useAuth } from "@/contexts/auth-context";

export default function NewTransactionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  }, [cartItems]);

  const grandTotal = useMemo(() => {
    return Math.max(subtotal - discount, 0);
  }, [subtotal, discount]);

  // Kalkulasi sisa stok otomatis (Stok Produk - Qty di Keranjang)
  const availableStockMap = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((product) => {
      const inCart =
        cartItems.find((item) => item.productId === product.id)?.qty || 0;
      map.set(product.id, Math.max(product.stock - inCart, 0));
    });
    return map;
  }, [products, cartItems]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = search.toLowerCase();

      return (
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  function handleAddToCart(product: Product) {
    const currentStock = availableStockMap.get(product.id) ?? 0;
    if (currentStock <= 0) return;

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.productId === product.id,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                qty: item.qty + 1,
                subtotal: (item.qty + 1) * item.price,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          subtotal: product.price,
        },
      ];
    });
  }

  function handleUpdateQty(productId: string, qty: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Cegah memasukkan jumlah melebihi stok asli produk
    if (qty > product.stock) {
      alert(`Stok maksimal untuk ${product.name} adalah ${product.stock}`);
      qty = product.stock;
    }

    if (qty < 1) return;

    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.productId === productId
          ? { ...item, qty, subtotal: qty * item.price }
          : item,
      ),
    );
  }

  function handleRemoveItem(productId: string) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId),
    );
  }

  async function handleCheckout() {
    if (!user) return;
    const transactionItems: TransactionItem[] = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.name,
      price: item.price,
      quantity: item.qty,
      subtotal: item.subtotal,
    }));
    const transactionId = await createTransaction(user.uid, {
      items: transactionItems,
      total: grandTotal,
      paidAmount,
      paymentMethod,
    });
    console.log(transactionId)
    router.push("/transactions/" + transactionId);
  }

  useEffect(() => {
   
    async function loadProducts() {
      try {
         if (!user) return;
        setLoading(true);

        const data = await getProducts(user.uid);
        setProducts(data);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="grid gap-3">
      <div className="mb-7">
        <p className="text-sm font-bold text-indigo-600">OVERVIEW</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Kasir</h1>
        <p className="mt-2 text-sm text-slate-500">------------------------</p>
      </div>
      {/* Search Input */}
      <Input
        placeholder="Cari nama atau SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2 pl-3 max-w-md"
      />

      {/* List Produk */}
      {filteredProducts.map((product) => {
        const availableStock = availableStockMap.get(product.id) ?? 0;

        return (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-2xl border bg-white p-4 hover:bg-slate-200"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-700">{product.name}</h3>
                <span className="text-xs font-semibold text-slate-500">
                  (Sisa: {availableStock})
                </span>
              </div>
              <p className="text-sm text-slate-800">
                {formatRupiah(product.price)}
              </p>
            </div>

            <Button
              onClick={() => handleAddToCart(product)}
              disabled={availableStock <= 0}
            >
              {availableStock <= 0 ? "Habis" : "Tambah"}
            </Button>
          </div>
        );
      })}

      {/* Tampilan Keranjang */}
      {cartItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <ShoppingCart className="mx-auto text-slate-700" />

          <h3 className="mt-4 font-bold">Keranjang masih kosong</h3>

          <p className="mt-1 text-sm text-slate-500">
            Pilih produk dari daftar di atas.
          </p>
        </div>
      ) : (
        <div className="text-center font-semibold">Isi Keranjang</div>
      )}

      {cartItems.map((item) => (
        <div key={item.productId} className="rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-4">
              <h3 className="font-bold text-slate-700">{item.name}</h3>
              <p className="text-sm text-slate-900">
                {formatRupiah(item.price)} x {item.qty}
              </p>
            </div>
            <Input
              type="number"
              min={1}
              value={item.qty}
              onChange={(event) =>
                handleUpdateQty(item.productId, Number(event.target.value))
              }
              className="flex-1 max-w-xs"
            />

            <button
              className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600 font-semibold cursor-pointer hover:bg-red-200 duration-200"
              onClick={() => handleRemoveItem(item.productId)}
            >
              Hapus
            </button>
          </div>
        </div>
      ))}

      {/* Ringkasan Total Sebelum Diskon */}
      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 font-semibold">
        <span className="text-slate-600">Subtotal</span>
        <span className="text-slate-900">{formatRupiah(subtotal)}</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="font-semibold p-2 rounded-md">Diskon</h1>
        <Input
          type="number"
          min={0}
          value={discount}
          onChange={(event) => setDiscount(Number(event.target.value))}
        />
      </div>

      <div className="flex justify-between">
        <p>Metode Pembayaran</p>
        <select
          className="text-right text-slate-800 bg-amber-50"
          value={paymentMethod}
          onChange={(event) =>
            setPaymentMethod(event.target.value as PaymentMethod)
          }
        >
          <option value="cash">Cash</option>
          <option value="transfer">Transfer</option>
          <option value="qris">QRIS</option>
        </select>
      </div>

      <Button
        type="button"
        disabled={cartItems.length === 0}
        onClick={handleCheckout}
        className="w-full"
      >
        Checkout
      </Button>
    </div>
  );
}
