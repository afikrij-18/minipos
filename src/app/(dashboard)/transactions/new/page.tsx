"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";
import type { CartItem, PaymentMethod } from "@/types/carts";
import { formatRupiah } from "@/utils/format";

export default function NewTransactionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [loading, setLoading] = useState(true);
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.subtotal, 0);
  }, [cartItems]);
  const grandTotal = useMemo(() => {
    return Math.max(subtotal - discount, 0);
  }, [subtotal, discount]);

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

  function handleCheckout() {
  if (cartItems.length === 0) {
    alert("Keranjang masih kosong");
    return;
  }

  const payload = {
    items: cartItems,
    subtotal,
    discount,
    grandTotal,
    paymentMethod,
  };

  console.log("checkout payload", payload);
  alert("Checkout berhasil disiapkan. Lihat console.");
}

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const data = await getProducts();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="grid gap-3">
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between rounded-2xl border bg-white p-4"
        >
          <div>
            <h3 className="font-bold text-slate-700">{product.name}</h3>
            <p className="text-sm text-slate-800">
              {formatRupiah(product.price)}
            </p>
          </div>

          <Button onClick={() => handleAddToCart(product)}>Tambah</Button>
                    
        </div>
      ))}
      {cartItems.length === 0 ? (
  <div className="rounded-2xl border border-dashed p-8 text-center">
    <ShoppingCart className="mx-auto text-slate-700" />

    <h3 className="mt-4 font-bold">
      Keranjang masih kosong
    </h3>

    <p className="mt-1 text-sm text-slate-500">
      Pilih produk dari daftar di sebelah kiri.
    </p>
  </div>
) : (
  <div>Render cart items</div>
)}
{cartItems.map((item) => (
  <div key={item.productId} className="rounded-2xl border bg-white p-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-bold text-slate-700">{item.name}</h3>
        
        <p className="text-sm text-slate-900">
          {formatRupiah(item.price)} x {item.qty}
        </p>        
      </div>
      
      <button className="cursor-pointer text-slate-900 font-bold" onClick={() => handleRemoveItem(item.productId)}>
        Hapus
      </button>
    </div>
    <Input
  type="number"
  min={1}
  value={item.qty}
  onChange={(event) =>
    handleUpdateQty(
      item.productId,
      Number(event.target.value)
    )
  }
/>
  </div>
   
))}
<Input
  type="number"
  min={0}
  value={discount}
  onChange={(event) =>
    setDiscount(Number(event.target.value))
  }
/>

<select className="text-right"
  value={paymentMethod}
  onChange={(event) =>
    setPaymentMethod(event.target.value as PaymentMethod)
  }
>
  <option value="cash">Cash</option>
  <option value="transfer">Transfer</option>
  <option value="qris">QRIS</option>
</select>
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
