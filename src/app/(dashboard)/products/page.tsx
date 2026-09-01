"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-600">
            MASTER DATA
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Produk
          </h1>

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
        />
      </div>

      <EmptyState 
        title="Belum ada produk"
        description="Tambahkan produk pertama untuk memulai transaksi POS."
      />
    </div>
  );
}