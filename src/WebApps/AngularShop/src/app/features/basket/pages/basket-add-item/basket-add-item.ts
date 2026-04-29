import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { BasketService } from '../../services/basket.service';
import { CurrentUserService } from '../../../../core/services/current-user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductService } from '../../../catalog/services/product.service';
import { Product } from '../../../catalog/models/product.model';
import { ShoppingCart, ShoppingCartItem } from '../../models/basket.model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-basket-add-item',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    LoadingSpinner,
    ErrorMessage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basket-add-item.html'
})
export class BasketAddItem implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly basketService = inject(BasketService);
  private readonly productService = inject(ProductService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  protected readonly userName = this.currentUser.userName;
  protected readonly products = signal<Product[]>([]);
  protected readonly loadingProducts = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    productId: ['', [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    color: ['Default']
  });

  ngOnInit(): void {
    if (!this.userName()) {
      this.router.navigate(['/basket']);
      return;
    }
    this.productService.list(1, 100).subscribe({
      next: (items) => {
        this.products.set(items);
        this.loadingProducts.set(false);
      },
      error: () => {
        this.error.set('Failed to load products.');
        this.loadingProducts.set(false);
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const userName = this.userName();
    if (!userName) return;

    const v = this.form.getRawValue();
    const product = this.products().find((p) => p.id === v.productId);
    if (!product) return;

    this.submitting.set(true);

    this.basketService.get(userName).subscribe({
      next: (cart) => this.merge(cart, product, v.quantity, v.color),
      error: (err) => {
        if (err?.status === 404) {
          this.merge({ userName, items: [] }, product, v.quantity, v.color);
        } else {
          this.submitting.set(false);
        }
      }
    });
  }

  private merge(cart: ShoppingCart, product: Product, qty: number, color: string): void {
    const existing = cart.items.find((i) => i.productId === product.id && i.color === color);
    let items: ShoppingCartItem[];
    if (existing) {
      items = cart.items.map((i) =>
        i === existing ? { ...i, quantity: i.quantity + qty } : i
      );
    } else {
      items = [
        ...cart.items,
        {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          color,
          price: product.price
        }
      ];
    }

    this.basketService.store({ userName: cart.userName, items }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notify.success(`Added ${qty} × ${product.name}.`);
        this.router.navigate(['/basket']);
      },
      error: () => this.submitting.set(false)
    });
  }
}
