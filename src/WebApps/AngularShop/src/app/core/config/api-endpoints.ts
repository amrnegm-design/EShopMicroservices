import { environment } from '../../../environments/environment';

const { catalogApi, basketApi, orderingApi } = environment.apiUrls;

export const API_ENDPOINTS = {
  catalog: {
    products: `${catalogApi}/products`,
    productById: (id: string) => `${catalogApi}/products/${id}`,
    productsByCategory: (category: string) => `${catalogApi}/products/category/${encodeURIComponent(category)}`
  },
  basket: {
    root: `${basketApi}/basket`,
    byUser: (userName: string) => `${basketApi}/basket/${encodeURIComponent(userName)}`,
    checkout: `${basketApi}/basket/checkout`
  },
  ordering: {
    orders: `${orderingApi}/orders`,
    orderById: (id: string) => `${orderingApi}/orders/${id}`,
    ordersByCustomer: (customerId: string) => `${orderingApi}/orders/customer/${customerId}`,
    ordersByName: (name: string) => `${orderingApi}/orders/${encodeURIComponent(name)}`
  }
} as const;
