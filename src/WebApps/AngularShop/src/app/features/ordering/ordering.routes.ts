import { Routes } from '@angular/router';

// Note: backend exposes only GET /orders/{orderName} (string) — no GET /orders/{id:guid}.
// So details + edit pages key off orderName, and rely on router state + a name-search fallback
// when the direct URL is hit.
export const ORDERING_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders' },
  {
    path: 'orders',
    pathMatch: 'full',
    loadComponent: () => import('./pages/order-list/order-list').then((m) => m.OrderList),
    title: 'Orders'
  },
  {
    path: 'orders/create',
    loadComponent: () => import('./pages/order-form/order-form').then((m) => m.OrderForm),
    title: 'New order'
  },
  {
    path: 'orders/find-by-name',
    loadComponent: () => import('./pages/order-by-name/order-by-name').then((m) => m.OrderByName),
    title: 'Find orders by name'
  },
  {
    path: 'orders/:orderName/edit',
    loadComponent: () => import('./pages/order-form/order-form').then((m) => m.OrderForm),
    title: 'Edit order'
  },
  {
    path: 'orders/:orderName',
    loadComponent: () => import('./pages/order-details/order-details').then((m) => m.OrderDetails),
    title: 'Order details'
  },
  {
    path: 'by-customer',
    loadComponent: () => import('./pages/order-by-customer/order-by-customer').then((m) => m.OrderByCustomer),
    title: 'Orders by customer'
  }
];
