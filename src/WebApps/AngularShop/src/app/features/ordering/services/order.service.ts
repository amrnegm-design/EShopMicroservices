import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_ENDPOINTS } from '../../../core/config/api-endpoints';
import { PaginatedResult } from '../../../core/models/paginated-result';
import {
  CreateOrderResponse,
  DeleteOrderResponse,
  GetOrdersByCustomerResponse,
  GetOrdersByNameResponse,
  GetOrdersResponse,
  OrderDto,
  UpdateOrderResponse
} from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  list(pageIndex = 0, pageSize = 10): Observable<PaginatedResult<OrderDto>> {
    const params = new HttpParams().set('PageIndex', pageIndex).set('PageSize', pageSize);
    return this.http
      .get<GetOrdersResponse>(API_ENDPOINTS.ordering.orders, { params })
      .pipe(map((r) => r.orders));
  }

  byCustomer(customerId: string): Observable<OrderDto[]> {
    return this.http
      .get<GetOrdersByCustomerResponse>(API_ENDPOINTS.ordering.ordersByCustomer(customerId))
      .pipe(map((r) => r.orders ?? []));
  }

  byName(name: string): Observable<OrderDto[]> {
    return this.http
      .get<GetOrdersByNameResponse>(API_ENDPOINTS.ordering.ordersByName(name))
      .pipe(map((r) => r.orders ?? []));
  }

  create(order: OrderDto): Observable<string> {
    return this.http
      .post<CreateOrderResponse>(API_ENDPOINTS.ordering.orders, { order })
      .pipe(map((r) => r.id));
  }

  update(order: OrderDto): Observable<boolean> {
    return this.http
      .put<UpdateOrderResponse>(API_ENDPOINTS.ordering.orders, { order })
      .pipe(map((r) => r.isSuccess));
  }

  delete(id: string): Observable<boolean> {
    return this.http
      .delete<DeleteOrderResponse>(API_ENDPOINTS.ordering.orderById(id))
      .pipe(map((r) => r.isSuccess));
  }
}
