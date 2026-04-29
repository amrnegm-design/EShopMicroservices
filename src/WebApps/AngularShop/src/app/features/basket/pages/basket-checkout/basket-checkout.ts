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
import { BasketCheckoutDto, ShoppingCart } from '../../models/basket.model';
import { CurrentUserService } from '../../../../core/services/current-user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../../../shared/components/error-message/error-message';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-basket-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinner,
    ErrorMessage,
    EmptyState
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basket-checkout.html',
  styles: [`
    h3 { margin: 24px 0 8px; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: .5px; }
    .summary { padding: 12px 16px; background: #f1f5f9; border-radius: 6px; margin-bottom: 16px; }
  `]
})
export class BasketCheckout implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly basketService = inject(BasketService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);

  protected readonly userName = this.currentUser.userName;
  protected readonly cart = signal<ShoppingCart | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    customerId: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    emailAddress: ['', [Validators.required, Validators.email]],
    addressLine: ['', [Validators.required]],
    country: ['', [Validators.required]],
    state: ['', [Validators.required]],
    zipCode: ['', [Validators.required]],
    cardName: ['', [Validators.required]],
    cardNumber: ['', [Validators.required, Validators.minLength(12)]],
    expiration: ['', [Validators.required]],
    cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
    paymentMethod: [1, [Validators.required]]
  });

  ngOnInit(): void {
    const u = this.userName();
    if (!u) {
      this.router.navigate(['/basket']);
      return;
    }
    this.form.patchValue({ customerId: '00000000-0000-0000-0000-000000000000' });
    this.basketService.get(u).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: (err) => {
        if (err?.status === 404) this.cart.set({ userName: u, items: [] });
        else this.error.set('Could not load basket.');
        this.loading.set(false);
      }
    });
  }

  protected total(): number {
    return (this.cart()?.items ?? []).reduce((s, i) => s + i.price * i.quantity, 0);
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const userName = this.userName();
    if (!userName) return;

    const v = this.form.getRawValue();
    const dto: BasketCheckoutDto = {
      userName,
      totalPrice: this.total(),
      customerId: v.customerId,
      firstName: v.firstName,
      lastName: v.lastName,
      emailAddress: v.emailAddress,
      addressLine: v.addressLine,
      country: v.country,
      state: v.state,
      zipCode: v.zipCode,
      cardName: v.cardName,
      cardNumber: v.cardNumber,
      expiration: v.expiration,
      cvv: v.cvv,
      paymentMethod: Number(v.paymentMethod)
    };

    this.submitting.set(true);
    this.basketService.checkout(dto).subscribe({
      next: () => {
        this.submitting.set(false);
        this.notify.success('Checkout submitted. The order will be created asynchronously.');
        this.router.navigate(['/ordering/orders']);
      },
      error: () => this.submitting.set(false)
    });
  }
}
