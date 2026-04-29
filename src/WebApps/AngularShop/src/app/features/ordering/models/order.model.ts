import { PaginatedResult } from '../../../core/models/paginated-result';

export enum OrderStatus {
  Draft = 1,
  Pending = 2,
  Completed = 3,
  Cancelled = 4
}

// Indexed by `number` so untyped table-row bindings (e.g. `mat-row {{ o.status }}`)
// don't trip strictTemplates with a `Record<OrderStatus, ...>` element-implicit-any error.
export const ORDER_STATUS_LABEL: { [key: number]: string } = {
  [OrderStatus.Draft]: 'Draft',
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Completed]: 'Completed',
  [OrderStatus.Cancelled]: 'Cancelled'
};

export interface AddressDto {
  firstName: string;
  lastName: string;
  emailAddress?: string | null;
  addressLine: string;
  country: string;
  state: string;
  zipCode: string;
}

export interface PaymentDto {
  cardName: string;
  cardNumber: string;
  expiration: string;
  cvv: string;
  paymentMethod: number;
}

export interface OrderItemDto {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderDto {
  id: string;
  customerId: string;
  orderName: string;
  shippingAddress: AddressDto;
  billingAddress: AddressDto;
  payment: PaymentDto;
  status: OrderStatus;
  orderItems: OrderItemDto[];
}

export interface GetOrdersResponse {
  orders: PaginatedResult<OrderDto>;
}

export interface GetOrdersByCustomerResponse {
  orders: OrderDto[];
}

export interface GetOrdersByNameResponse {
  orders: OrderDto[];
}

export interface CreateOrderResponse {
  id: string;
}

export interface UpdateOrderResponse {
  isSuccess: boolean;
}

export interface DeleteOrderResponse {
  isSuccess: boolean;
}
