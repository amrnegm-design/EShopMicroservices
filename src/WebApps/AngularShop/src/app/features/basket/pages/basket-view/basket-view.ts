import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

import { BasketService } from '../../services/basket.service';
import { ShoppingCart, ShoppingCartItem } from '../../models/basket.model';
import { CurrentUserService } from '../../../../core/services/current-user.service';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-basket-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    LoadingSpinner,
    ErrorMessage,
    EmptyState
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basket-view.html',
  styles: [`
    .user-card { max-width: 480px; padding: 16px; margin-bottom: 16px; }
    .user-card mat-form-field { width: 100%; }
    .user-card .row { display: flex; gap: 8px; align-items: center; }
    .total { display: flex; justify-content: flex-end; padding: 16px; font-size: 18px; font-weight: 500; }
    .total span { margin-left: 12px; color: #16a34a; }
    table { width: 100%; }
  `]
})
export class BasketView implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly currentUser = inject(CurrentUserService);
  private readonly basketService = inject(BasketService);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);

  protected readonly userName = this.currentUser.userName;

  protected readonly userForm = this.fb.nonNullable.group({
    userName: ['', [Validators.required, Validators.maxLength(60)]]
  });

  protected readonly cart = signal<ShoppingCart | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly displayedColumns = ['product', 'color', 'quantity', 'price', 'subtotal', 'actions'];

  protected readonly hasItems = computed(() => (this.cart()?.items?.length ?? 0) > 0);

  ngOnInit(): void {
    const u = this.userName();
    if (u) {
      this.userForm.patchValue({ userName: u });
      this.load(u);
    }
  }

  protected setUser(): void {
    if (this.userForm.invalid) return;
    const name = this.userForm.controls.userName.value.trim();
    this.currentUser.set(name);
    this.load(name);
  }

  protected switchUser(): void {
    this.currentUser.clear();
    this.cart.set(null);
    this.userForm.reset({ userName: '' });
  }

  protected load(name: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.basketService.get(name).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 404) {
          this.cart.set({ userName: name, items: [], totalPrice: 0 });
        } else {
          this.error.set('Could not load basket.');
        }
      }
    });
  }

  protected subtotal(item: ShoppingCartItem): number {
    return item.price * item.quantity;
  }

  protected total(): number {
    const items = this.cart()?.items ?? [];
    return items.reduce((sum, i) => sum + this.subtotal(i), 0);
  }

  protected async removeItem(item: ShoppingCartItem): Promise<void> {
    const cart = this.cart();
    if (!cart) return;
    const confirmed = await this.confirm.ask({
      title: 'Remove item',
      message: `Remove "${item.productName}" from the basket?`,
      destructive: true,
      confirmText: 'Remove'
    });
    if (!confirmed) return;

    const next: ShoppingCart = {
      userName: cart.userName,
      items: cart.items.filter((i) => i.productId !== item.productId)
    };
    this.basketService.store(next).subscribe({
      next: () => {
        this.notify.success('Item removed.');
        this.load(cart.userName);
      }
    });
  }

  protected async clearBasket(): Promise<void> {
    const cart = this.cart();
    if (!cart) return;
    const confirmed = await this.confirm.ask({
      title: 'Clear basket',
      message: 'Permanently delete the entire basket?',
      destructive: true,
      confirmText: 'Clear basket'
    });
    if (!confirmed) return;
    this.basketService.delete(cart.userName).subscribe({
      next: () => {
        this.notify.success('Basket cleared.');
        this.cart.set({ userName: cart.userName, items: [], totalPrice: 0 });
      }
    });
  }
}
