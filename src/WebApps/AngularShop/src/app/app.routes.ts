import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard'
  },
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES)
  },
  {
    path: 'basket',
    loadChildren: () => import('./features/basket/basket.routes').then((m) => m.BASKET_ROUTES)
  },
  {
    path: 'ordering',
    loadChildren: () => import('./features/ordering/ordering.routes').then((m) => m.ORDERING_ROUTES)
  },
  { path: '**', redirectTo: 'dashboard' }
];
