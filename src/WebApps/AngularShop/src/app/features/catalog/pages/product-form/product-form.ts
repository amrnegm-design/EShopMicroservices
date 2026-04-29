import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ProductService } from '../../services/product.service';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { NotificationService } from '../../../../core/services/notification.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinner
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.html'
})
export class ProductForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProductService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly notify = inject(NotificationService);

  readonly id = input<string | undefined>();

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    imageFile: ['product-1.png', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    category: ['', [Validators.required]]
  });

  protected readonly editMode = computed(() => !!this.id());
  protected readonly submitting = signal(false);
  protected readonly initializing = signal(false);

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    this.initializing.set(true);
    this.service.getById(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          name: p.name,
          description: p.description,
          imageFile: p.imageFile,
          price: p.price,
          category: (p.category ?? []).join(', ')
        });
        this.initializing.set(false);
      },
      error: () => {
        this.initializing.set(false);
        this.notify.error('Failed to load product for editing.');
        this.router.navigate(['/catalog/products']);
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      name: v.name.trim(),
      description: v.description.trim(),
      imageFile: v.imageFile.trim(),
      price: Number(v.price),
      category: v.category.split(',').map((s) => s.trim()).filter(Boolean)
    };

    this.submitting.set(true);

    const id = this.id();
    if (id) {
      const updated: Product = { id, ...payload };
      this.service.update(updated).subscribe({
        next: () => {
          this.submitting.set(false);
          this.notify.success('Product updated.');
          this.router.navigate(['/catalog/products', id]);
        },
        error: () => this.submitting.set(false)
      });
    } else {
      this.service.create(payload).subscribe({
        next: (newId) => {
          this.submitting.set(false);
          this.notify.success('Product created.');
          this.router.navigate(['/catalog/products', newId]);
        },
        error: () => this.submitting.set(false)
      });
    }
  }

  protected cancel(): void {
    this.location.back();
  }
}
