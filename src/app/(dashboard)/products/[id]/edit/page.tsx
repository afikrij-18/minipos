"use client";

import { ProductForm } from "@/components/products/product-form";
import { getProductByid, updateProduct } from "@/lib/product-storage";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";



import type { ProductInput, Product,} from "@/types/product";


export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id : string}>();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedProduct = getProductByid(params.id);

    setProduct(selectedProduct);
    setLoading(false);
  }, [params.id]);

  if(loading) {
    return <p>Mmemuat produk ...</p>;
  }
  if (!product) {
    return <p>Produk tidak ditemukan.</p>
  }

  function handleSubmit(input: ProductInput) {
    if (!product) return
  updateProduct(product.id, input);

  router.push ("/products");
}
return (
  <div>
    <p className="text-sm font-bold text-indigo-600">
      MASTER DATA
    </p>
    <h1 className="mt-1 text-3xl font-black">
      Edit Produk
    </h1>

    <ProductForm
      initialValues = {product}
      submitLabel="Simpan Perubahan"
      onSubmit={handleSubmit}
      />
  </div>
)
}


