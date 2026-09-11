"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteProduct } from "@/services/product.service";
// import { getProducts } from "@/utils/product-storage";
import { Plus, Search } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import type { Product } from "@/types/product";
import { Pencil, Trash2 } from "lucide-react";
import { getProducts } from "@/services/product.service";
import { useAuth } from "@/contexts/auth-context";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  // const [keyword, setKeyword] = useState(" ");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  async function loadProducts() {
    try {
      if (!user) return;
      setLoading(true);
      setError("");

      const data = await getProducts(user.uid);
      console.log(data)

      setProducts(data);
    } catch (error) {
      console.error(error);
      setError("Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!user) return;
    
    const confirmed = window.confirm("Yakin ingin menghapis produk ini?");

    if (!confirmed) return;

    await deleteProduct(user.uid, id);

    await loadProducts();
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.sku.toLowerCase().includes(keyword),
    );
  }, [products, search]);

  useEffect(() => {
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p6">Memuat data produk..</div>
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-600">MASTER DATA</p>

          <h1 className="mt-1 text-3xl font-black tracking-tight">Produk</h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola produk, harga, dan stok
          </p>
        </div>

        <Link href="/products/create">
          <Button className="w-full sm:w-auto">
            <Plus size={18} />
            Tambah Produk
          </Button>
        </Link>
      </div>

      <div className="mb-5 max-w-md">
        <Input
          placeholder="Cari nama atau SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-3"
        />
      </div>

      {filtered.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Produk</th>
                  <th className="px-5 py-4">SKU</th>
                  <th className="px-5 py-4">Harga</th>
                  <th className="px-5 py-4">Stok</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((product) => {
                  const stockColor =
                    product.stock <= 5
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800";
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {product.name}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-700">
                        {product.sku}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-semibold">
                        {formatCurrency(product.price)}
                      </td>

                      <td className="px-5 py-4 ">
                        <span
                          className={
                            "rounded-full px-2.5 py-1 text-sm font-bold " +
                            stockColor
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={"/products/" + product.id + "/edit"}
                            className="rounded-lg border px-3 py-2 text-sm text-slate-600 font-semibold hover:bg-slate-200 duration-200"
                          >
                            <div className="flex gap-1.5 items-center">
                              <Pencil size={15} />
                              Edit
                            </div>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className=" rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-600 font-semibold cursor-pointer hover:bg-red-200 duration-200 "
                          >
                            <div className="flex gap-1.5 items-center">
                              <Trash2 size={16} /> Hapus
                            </div>
                          </button>
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

      {products.length === 0 && (
        <EmptyState
          title="Belum ada produk"
          description="Tambahkan produk pertama untuk memulai transaksi POS."
        />
      )}
      {products.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
          <Search className="mx-auto mb-2" />
          Produk tidak ditemukan.
        </div>
      )}
    </div>
  );
}
