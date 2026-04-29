import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../../../core/config/api-endpoints';
import {
  CreateProductResponse,
  DeleteProductResponse,
  GetProductByCategoryResponse,
  GetProductByIdResponse,
  GetProductsResponse,
  Product,
  ProductInput,
  UpdateProductResponse
} from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  list(pageNumber = 1, pageSize = 20): Observable<Product[]> {
    const params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);
    return this.http
      .get<GetProductsResponse>(API_ENDPOINTS.catalog.products, { params })
      .pipe(map((r) => r.products ?? []));
  }

  getById(id: string): Observable<Product> {
    return this.http
      .get<GetProductByIdResponse>(API_ENDPOINTS.catalog.productById(id))
      .pipe(map((r) => r.product));
  }

  byCategory(category: string): Observable<Product[]> {
    return this.http
      .get<GetProductByCategoryResponse>(API_ENDPOINTS.catalog.productsByCategory(category))
      .pipe(map((r) => r.products ?? []));
  }

  create(product: ProductInput): Observable<string> {
    return this.http
      .post<CreateProductResponse>(API_ENDPOINTS.catalog.products, { product })
      .pipe(map((r) => r.id));
  }

  update(product: Product): Observable<boolean> {
    return this.http
      .put<UpdateProductResponse>(API_ENDPOINTS.catalog.products, product)
      .pipe(map((r) => r.isSuccess));
  }

  delete(id: string): Observable<boolean> {
    return this.http
      .delete<DeleteProductResponse>(API_ENDPOINTS.catalog.productById(id))
      .pipe(map((r) => r.isSuccess));
  }
}
