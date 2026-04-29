import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .brand {
      padding: 18px 20px;
      font-size: 18px;
      font-weight: 500;
      letter-spacing: .5px;
      border-bottom: 1px solid rgba(255, 255, 255, .08);
    }
    a.mat-mdc-list-item {
      color: #e2e8f0 !important;
      --mdc-list-list-item-label-text-color: #e2e8f0;
      --mdc-list-list-item-leading-icon-color: #94a3b8;
    }
    a.mat-mdc-list-item.active {
      background: rgba(96, 165, 250, .12);
      --mdc-list-list-item-label-text-color: #93c5fd;
      --mdc-list-list-item-leading-icon-color: #93c5fd;
    }
    .group {
      padding: 16px 20px 4px;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #94a3b8;
    }
  `],
  template: `
    <div class="brand">eShop Microservices</div>
    <mat-nav-list>
      <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
        <mat-icon matListItemIcon>dashboard</mat-icon>
        <span matListItemTitle>Dashboard</span>
      </a>

      <div class="group">Catalog</div>
      <a mat-list-item routerLink="/catalog/products" routerLinkActive="active">
        <mat-icon matListItemIcon>inventory_2</mat-icon>
        <span matListItemTitle>Products</span>
      </a>
      <a mat-list-item routerLink="/catalog/categories" routerLinkActive="active">
        <mat-icon matListItemIcon>category</mat-icon>
        <span matListItemTitle>Browse by category</span>
      </a>

      <div class="group">Basket</div>
      <a mat-list-item routerLink="/basket" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        <mat-icon matListItemIcon>shopping_cart</mat-icon>
        <span matListItemTitle>My basket</span>
      </a>
      <a mat-list-item routerLink="/basket/checkout" routerLinkActive="active">
        <mat-icon matListItemIcon>payments</mat-icon>
        <span matListItemTitle>Checkout</span>
      </a>

      <div class="group">Ordering</div>
      <a mat-list-item routerLink="/ordering/orders" routerLinkActive="active">
        <mat-icon matListItemIcon>receipt_long</mat-icon>
        <span matListItemTitle>Orders</span>
      </a>
      <a mat-list-item routerLink="/ordering/orders/create" routerLinkActive="active">
        <mat-icon matListItemIcon>add_shopping_cart</mat-icon>
        <span matListItemTitle>New order</span>
      </a>
      <a mat-list-item routerLink="/ordering/by-customer" routerLinkActive="active">
        <mat-icon matListItemIcon>person_search</mat-icon>
        <span matListItemTitle>Orders by customer</span>
      </a>
    </mat-nav-list>
  `
})
export class Sidebar {}
