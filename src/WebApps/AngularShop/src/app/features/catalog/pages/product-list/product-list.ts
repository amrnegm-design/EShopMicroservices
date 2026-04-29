import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    LoadingSpinner,
    EmptyState,
    ErrorMessage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.scss']
})
export class ProductList implements OnInit {
  private readonly service = inject(ProductService);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotificationService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly displayedColumns = ['name', 'category', 'price', 'actions'];
  protected readonly hasProducts = computed(() => this.products().length > 0);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  protected async onDelete(product: Product): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete product',
      message: `Permanently delete "${product.name}"?`,
      confirmText: 'Delete',
      destructive: true
    });
    if (!confirmed) return;

    this.service.delete(product.id).subscribe({
      next: () => {
        this.notify.success(`Deleted "${product.name}".`);
        this.products.update((list) => list.filter((p) => p.id !== product.id));
      },
      error: () => {
        // error toast already shown by interceptor
      }
    });
  }
}
