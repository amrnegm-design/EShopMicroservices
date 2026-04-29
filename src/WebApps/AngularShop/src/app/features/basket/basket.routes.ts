import { Routes } from '@angular/router';

export const BASKET_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/basket-view/basket-view').then((m) => m.BasketView),
    title: 'My basket'
  },
  {
    path: 'add',
    loadComponent: () => import('./pages/basket-add-item/basket-add-item').then((m) => m.BasketAddItem),
    title: 'Add to basket'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/basket-checkout/basket-checkout').then((m) => m.BasketCheckout),
    title: 'Checkout'
  }
];
