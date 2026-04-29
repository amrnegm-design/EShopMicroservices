import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { environment } from '../../../environments/environment';

interface ServiceTile {
  name: string;
  description: string;
  icon: string;
  color: string;
  baseUrl: string;
  primary: { label: string; route: string };
  secondary?: { label: string; route: string };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./dashboard.scss'],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  protected readonly mode = environment.mode;
  protected readonly services: ServiceTile[] = [
    {
      name: 'Catalog',
      description: 'Browse, create, and manage the product catalog.',
      icon: 'inventory_2',
      color: '#2563eb',
      baseUrl: environment.apiUrls.catalogApi,
      primary: { label: 'View products', route: '/catalog/products' },
      secondary: { label: 'Browse by category', route: '/catalog/categories' }
    },
    {
      name: 'Basket',
      description: 'Build, view, and check out a shopping cart per user.',
      icon: 'shopping_cart',
      color: '#16a34a',
      baseUrl: environment.apiUrls.basketApi,
      primary: { label: 'Open basket', route: '/basket' },
      secondary: { label: 'Checkout', route: '/basket/checkout' }
    },
    {
      name: 'Ordering',
      description: 'Create, edit, and inspect orders raised by customers.',
      icon: 'receipt_long',
      color: '#9333ea',
      baseUrl: environment.apiUrls.orderingApi,
      primary: { label: 'View orders', route: '/ordering/orders' },
      secondary: { label: 'New order', route: '/ordering/orders/create' }
    }
  ];
}
