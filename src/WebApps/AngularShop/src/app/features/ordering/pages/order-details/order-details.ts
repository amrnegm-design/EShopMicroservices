import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import { OrderService } from '../../services/order.service';
import { ORDER_STATUS_LABEL, OrderDto } from '../../models/order.model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    LoadingSpinner,
    ErrorMessage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-details.html',
  styles: [`
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
    dl { display: grid; grid-template-columns: 130px 1fr; row-gap: 6px; column-gap: 12px; margin: 0; }
    dt { font-weight: 500; color: #64748b; }
    dd { margin: 0; word-break: break-word; }
    .status-chip { font-size: 12px; }
    table { width: 100%; }
  `]
})
export class OrderDetails implements OnInit {
  private readonly service = inject(OrderService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly orderName = input.required<string>();

  protected readonly order = signal<OrderDto | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly statusLabel = ORDER_STATUS_LABEL;

  protected readonly itemColumns = ['product', 'qty', 'price', 'subtotal'];
  protected readonly total = computed(() => {
    const items = this.order()?.orderItems ?? [];
    return items.reduce((s, i) => s + i.price * i.quantity, 0);
  });

  ngOnInit(): void {
    const fromState = this.router.getCurrentNavigation()?.extras?.state?.['order'] as OrderDto | undefined
      ?? (history.state?.['order'] as OrderDto | undefined);

    if (fromState) {
      this.order.set(fromState);
      this.loading.set(false);
      return;
    }

    this.service.byName(this.orderName()).subscribe({
      next: (orders) => {
        if (orders.length === 0) {
          this.error.set(`No order found with name "${this.orderName()}".`);
        } else {
          this.order.set(orders[0]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load order.');
        this.loading.set(false);
      }
    });
  }

  protected back(): void {
    this.location.back();
  }
}
