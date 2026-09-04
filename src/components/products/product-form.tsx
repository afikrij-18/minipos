"use client";
import React from 'react'

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "../ui/input";
import { ProductInput } from "@/types/product";
// import { error } from 'console';

type ProductFormProps = {
  initialValues?: ProductInput;
  submitLabel?: string;
  onSubmit: (values: ProductInput) => void;
};

const defaultValues: ProductInput = {
  name: '',
  sku: '',
  price: 0,
  stock: 0,
};




export function ProductForm({initialValues = defaultValues, submitLabel = "Simpan Produk", onSubmit}: ProductFormProps){
  const [values, setValues] = 
    useState<ProductInput>({
      name: initialValues?.name ?? "",
      sku: initialValues?.sku ?? "",
      price: initialValues?.price ?? "",
      stock: initialValues?.stock ?? "",
    });
    
  function updateField(
    field: keyof ProductInput,
    value: string
  ) {
    setValues ((current) => ({
      ...current,
      [field]: field === "price" || field === "stock"
        ? Number(value)
        : value,
  }));
  }
const [errors, setErrors] = useState<FormErrors>({});

function handleSubmit (event: React.SyntheticEvent<HTMLFormElement>) {
  event.preventDefault();
  const validationErrors = validateProduct(values);
  setErrors(validationErrors);

  if (Object.keys(validationErrors).length > 0) {
    return;
  }
  onSubmit(values);
}

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
     <div>
       <label className='text-sm font-bold text-slate-700'>
        Nama Produk
       </label>

       <Input
        value={values.name}
        onChange={(event) => updateField ("name", event.target.value)}
        placeholder='Contoh : Kopi Susu'
       />
       {errors.name && (
        <p className='mt-1 text-sm font-semibold text-red-600'>
          {errors.name}
        </p>
       )}
      </div>
     <div>
       <label className='text-sm font-bold text-slate-700'>
        SKU Produk
       </label>

       <Input
        value={values.sku}
        onChange={(event) => updateField ("sku", event.target.value)}
        placeholder='KOPI001'
       />
       {errors.sku && (
        <p className='mt-1 text-sm font-semibold text-red-600'>
          {errors.sku}
        </p>
       )}
      </div>

      <div>
          <label className='text-sm font-bold text-slate-700'>
            Harga Produk
          </label>
          <Input 
            type ="number"
            value={values.price}
            onChange={(event) => updateField("price", event.target.value)}
            placeholder="Contoh: 18000"
            />
            {errors.price && (
        <p className='mt-1 text-sm font-semibold text-red-600'>
          {errors.price}
        </p>
       )}
        </div>

       <div>
        <label className='text-sm font-bold text-slate-700'>
          Stok Produk
        </label>
        <Input
          type ="number"
          value={values.stock}
          onChange={(event) => updateField("stock", event.target.value)}
          placeholder='Contoh: 12'
          />
         {errors.stock && (
        <p className='mt-1 text-sm font-semibold text-red-600'>
          {errors.stock}
        </p>
       )}
        </div>
  
      <div className='flex items-center justify-end gap-3'>
        <Button variant="secondary">
          <Link href="/products">Batal</Link>
        </Button>
        <Button type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );

}

type FormErrors = Partial<Record<keyof ProductInput, string>>;
function validateProduct(values: ProductInput) {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Nama produk wajib diisi.";
  }

  if (!values.sku.trim()) {
    errors.sku = "SKU wajib diisi.";
  }
  if (values.price <= 0 ) {
    errors.price = "Harga harus lebih dari nol."
  }
  if (values.stock < 0 ) {
    errors.stock = "Stock tidak boleh minus."
  }  
  return errors;
}

