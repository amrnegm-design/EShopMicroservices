import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingSpinner,
    ErrorMessage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Product details</h1>
        <div class="actions">
          <button mat-stroked-button (click)="back()"><mat-icon>arrow_back</mat-icon> Back</button>
          @if (product(); as p) {
            <a mat-flat-button color="primary" [routerLink]="['/catalog/products', p.id, 'edit']">
              <mat-icon>edit</mat-icon> Edit
            </a>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (error(); as err) {
        <app-error-message [message]="err" />
      } @else if (product(); as p) {
        <mat-card appearance="outlined" class="details">
          <mat-card-header>
            <mat-card-title>{{ p.name }}</mat-card-title>
            <mat-card-subtitle>{{ p.id }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ p.description }}</p>
            <dl>
              <dt>Price</dt><dd>{{ p.price | currency }}</dd>
              <dt>Image</dt><dd><code>{{ p.imageFile || '—' }}</code></dd>
              <dt>Categories</dt>
              <dd>
                <mat-chip-set>
                  @for (c of p.category; track c) { <mat-chip>{{ c }}</mat-chip> }
                </mat-chip-set>
              </dd>
            </dl>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .details dl { display: grid; grid-template-columns: 140px 1fr; row-gap: 8px; column-gap: 16px; margin: 16px 0 0; }
    .details dt { font-weight: 500; color: #64748b; }
    .details dd { margin: 0; }
  `]
})
export class ProductDetails implements OnInit {
  private readonly service = inject(ProductService);
  private readonly location = inject(Location);

  readonly id = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.service.getById(this.id()).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load product.');
        this.loading.set(false);
      }
    });
  }

  protected back(): void {
    this.location.back();
  }
}
