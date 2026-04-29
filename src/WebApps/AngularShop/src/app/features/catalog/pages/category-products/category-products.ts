import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';

@Component({
  selector: 'app-category-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    LoadingSpinner,
    EmptyState,
    ErrorMessage
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-products.html',
  styles: [`
    .search { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; max-width: 520px; }
    .search mat-form-field { flex: 1; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    mat-card-content p { color: #475569; min-height: 38px; }
    .price { font-weight: 500; color: #0f172a; }
  `]
})
export class CategoryProducts {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductService);

  protected readonly form = this.fb.nonNullable.group({
    category: ['', [Validators.required]]
  });

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly searchedFor = signal<string | null>(null);
  protected readonly hasResults = computed(() => this.products().length > 0);

  protected search(): void {
    if (this.form.invalid) return;
    const cat = this.form.controls.category.value.trim();
    if (!cat) return;

    this.searchedFor.set(cat);
    this.loading.set(true);
    this.error.set(null);

    this.service.byCategory(cat).subscribe({
      next: (items) => {
        this.products.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No products found for that category, or the request failed.');
        this.products.set([]);
        this.loading.set(false);
      }
    });
  }
}
