export interface Product {
  id: string;
  name: string;
  category: string[];
  description: string;
  imageFile: string;
  price: number;
}

export type ProductInput = Omit<Product, 'id'>;

export interface GetProductsResponse {
  products: Product[];
}

export interface GetProductByIdResponse {
  product: Product;
}

export interface GetProductByCategoryResponse {
  products: Product[];
}

export interface CreateProductResponse {
  id: string;
}

export interface UpdateProductResponse {
  isSuccess: boolean;
}

export interface DeleteProductResponse {
  isSuccess: boolean;
}
