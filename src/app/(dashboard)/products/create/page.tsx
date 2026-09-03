"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";
// import { addProduct } from "@/utils/product-storage";
import { ProductInput } from "@/types/product";
import { addProduct } from "@/utils/product-storage";


export default function CreateProductPage() {
  const router = useRouter();

    function handleCreateProduct(value: ProductInput) {
      addProduct(value);
      router.push("/products");
    }
  return (
    <div className="max-w-2xl">
        <p className="text-sm font-bold text-indigo-600">
          MASTER DATA
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">
          Tambah Produk
        </h1>
      <p className="mt-2 text-sm text-slate-500">
        Isi data produk yang akan dijual di MiniPOS.
    </p>
      <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <ProductForm onSubmit={handleCreateProduct} />
      </div>
    </div>
  );
}
