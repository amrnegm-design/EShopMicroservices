import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../../../core/config/api-endpoints';
import {
  BasketCheckoutDto,
  CheckoutBasketResponse,
  DeleteBasketResponse,
  GetBasketResponse,
  ShoppingCart,
  StoreBasketResponse
} from '../models/basket.model';

@Injectable({ providedIn: 'root' })
export class BasketService {
  private readonly http = inject(HttpClient);

  get(userName: string): Observable<ShoppingCart> {
    return this.http
      .get<GetBasketResponse>(API_ENDPOINTS.basket.byUser(userName))
      .pipe(map((r) => r.cart));
  }

  store(cart: ShoppingCart): Observable<string> {
    return this.http
      .post<StoreBasketResponse>(API_ENDPOINTS.basket.root, { cart })
      .pipe(map((r) => r.userName));
  }

  delete(userName: string): Observable<boolean> {
    return this.http
      .delete<DeleteBasketResponse>(API_ENDPOINTS.basket.byUser(userName))
      .pipe(map((r) => r.isSuccess));
  }

  checkout(dto: BasketCheckoutDto): Observable<boolean> {
    return this.http
      .post<CheckoutBasketResponse>(API_ENDPOINTS.basket.checkout, { basketCheckoutDto: dto })
      .pipe(map((r) => r.isSuccess));
  }
}
