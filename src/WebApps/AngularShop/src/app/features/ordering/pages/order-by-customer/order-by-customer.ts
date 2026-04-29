import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import { OrderService } from '../../services/order.service';
import { ORDER_STATUS_LABEL, OrderDto } from '../../models/order.model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-order-by-customer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    LoadingSpinner,
    ErrorMessage,
    EmptyState
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-by-customer.html',
  styles: [`
    form { display: flex; gap: 12px; max-width: 720px; margin-bottom: 16px; }
    form mat-form-field { flex: 1; }
    table { width: 100%; }
  `]
})
export class OrderByCustomer {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OrderService);
  private readonly router = inject(Router);

  protected readonly statusLabel = ORDER_STATUS_LABEL;
  protected readonly orders = signal<OrderDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly searched = signal(false);
  protected readonly hasResults = computed(() => this.orders().length > 0);

  protected readonly form = this.fb.nonNullable.group({
    customerId: ['', [Validators.required]]
  });

  protected readonly displayedColumns = ['orderName', 'status', 'items', 'view'];

  protected search(): void {
    if (this.form.invalid) return;
    const id = this.form.controls.customerId.value.trim();
    this.searched.set(true);
    this.loading.set(true);
    this.error.set(null);

    this.service.byCustomer(id).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.loading.set(false);
        this.error.set('No orders found for that customer, or the request failed.');
      }
    });
  }

  protected viewOrder(order: OrderDto): void {
    this.router.navigate(['/ordering/orders', order.orderName], { state: { order } });
  }
}
