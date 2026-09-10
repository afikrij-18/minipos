" use client";

import {db} from "@/lib/firebase";
import type {Product, ProductInput} from "@/types/product";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";




  export const DEMO_USER_ID = "demo-user";
  function productCollection(){
    return collection(
      db, "users",
      DEMO_USER_ID, "products"
    );
  }

  export async function getProducts(): Promise<Product[]>{
    const productsQuery = query(
      productCollection(),
      orderBy("createdAt", "desc")
    )

    const snapshot = await getDocs(productsQuery);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  }

  export async function addProduct(input: ProductInput){
    await addDoc(productCollection(),{
      ...input,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  export async function updateProduct(
    id: string,
    input: ProductInput
  ) {
    const productRef = doc(
      db, "users", DEMO_USER_ID, "products", id
    );

    await updateDoc(productRef, {
      ...input, updateAt: serverTimestamp(),
    });
  }

  export async function deleteProduct(id:string) {
    const productRef = doc(
      db, "users", DEMO_USER_ID, "products", id
    );
    await deleteDoc(productRef);
  }

  export async function getProductByid(id: string){
    const products = await getProducts();

    return products.find(
      (product) => product.id === id
    );
  }

  