"use client";

import { ProductForm } from "@/components/products/product-form";
import { getProduct, updateProduct } from "@/services/product.service";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ProductInput, Product } from "@/types/product";
import { useAuth } from "@/contexts/auth-context";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductInput | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProduct(user.uid, params.id).then((product) => {
      if (!product) return setNotFound(true);
      setProduct({
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
      });
    });
  }, [user, params.id]);

  if (notFound)
    return (
      <div className="rounded-2xl bg-white p-6">"Produk tidak ditemukan.</div>
    );
  if (!product)
    return <div className="rounded-2xl bg-white p-6">Memuat produk...</div>;

  return (
    <div>
      <p className="text-sm font-bold text-indigo-600">Produk</p>
      <h1 className="mt-1 text-3xl font-black">Edit Produk</h1>

      <ProductForm
        initialValues={product}
        submitLabel="Simpan Perubahan"
        onSubmit={async (data) => {
          if (!user) return;
          await updateProduct(user.uid, params.id, data);
          router.push("/products");
        }}
      />
    </div>
  );
}
//  dalam bentuk yang lain
//  async function handleSubmit(input: ProductInput) {
//     if (!user) return;
//     if (!product) return;
//     await updateProduct(user.uid, product.id, input);
//     router.push("/products");
//   }

//   useEffect(() => {
//     async function loadDataProduct() {
//       if (!user) return;
//       const data = await getProduct(user.uid, params.id);
//       setProduct(data ?? null);
//     }
//     loadDataProduct();
//     setLoading(false);
//   }, [params.id]);

//   if (loading) {
//     return <p>Memuat produk ...</p>;
//   }
//   if (!product) {
//     return <p>Produk tidak ditemukan.</p>;
//   }

//   return (
//     <div>
//       <p className="text-sm font-bold text-indigo-600">Produk</p>
//       <h1 className="mt-1 text-3xl font-black">Edit Produk</h1>

//       <ProductForm
//         initialValues={product}
//         submitLabel="Simpan Perubahan"
//         onSubmit={handleSubmit}
//       />
//     </div>
//   );
// }
