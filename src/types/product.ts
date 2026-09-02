export type Product = {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
};

export type ProductInput = Omit<Product, "id">;