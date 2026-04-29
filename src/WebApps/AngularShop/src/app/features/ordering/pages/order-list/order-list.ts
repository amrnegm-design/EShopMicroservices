import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { OrderService } from '../../services/order.service';
import { ORDER_STATUS_LABEL, OrderDto } from '../../models/order.model';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    LoadingSpinner,
    ErrorMessage,
    EmptyState
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-list.html',
  styles: [`
    table { width: 100%; }
    .actions-col { width: 160px; text-align: right; }
    .status { font-size: 12px; }
  `]
})
export class OrderList implements OnInit {
  private readonly service = inject(OrderService);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly statusLabel = ORDER_STATUS_LABEL;

  protected readonly orders = signal<OrderDto[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly displayedColumns = ['orderName', 'status', 'items', 'customer', 'actions'];
  protected readonly hasOrders = computed(() => this.orders().length > 0);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list(this.pageIndex(), this.pageSize()).subscribe({
      next: (page) => {
        this.orders.set(page.data ?? []);
        this.total.set(page.count ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load orders.');
        this.loading.set(false);
      }
    });
  }

  protected onPage(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
    this.load();
  }

  protected viewOrder(order: OrderDto): void {
    this.router.navigate(['/ordering/orders', order.orderName], { state: { order } });
  }

  protected editOrder(order: OrderDto): void {
    this.router.navigate(['/ordering/orders', order.orderName, 'edit'], { state: { order } });
  }

  protected async deleteOrder(order: OrderDto): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete order',
      message: `Permanently delete order "${order.orderName}"?`,
      confirmText: 'Delete',
      destructive: true
    });
    if (!confirmed) return;

    this.service.delete(order.id).subscribe({
      next: () => {
        this.notify.success('Order deleted.');
        this.load();
      }
    });
  }
}
