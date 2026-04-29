import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  {
    path: 'products',
    loadComponent: () => import('./pages/product-list/product-list').then((m) => m.ProductList),
    title: 'Products'
  },
  {
    path: 'products/create',
    loadComponent: () => import('./pages/product-form/product-form').then((m) => m.ProductForm),
    title: 'New product'
  },
  {
    path: 'products/:id/edit',
    loadComponent: () => import('./pages/product-form/product-form').then((m) => m.ProductForm),
    title: 'Edit product'
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-details/product-details').then((m) => m.ProductDetails),
    title: 'Product details'
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/category-products/category-products').then((m) => m.CategoryProducts),
    title: 'Browse by category'
  }
];
