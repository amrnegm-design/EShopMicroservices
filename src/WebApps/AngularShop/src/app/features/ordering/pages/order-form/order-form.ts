import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { OrderService } from '../../services/order.service';
import { OrderDto, OrderStatus } from '../../models/order.model';
import { LoadingSpinner } from '../../../../shared/components/loading-spinner/loading-spinner';
import { NotificationService } from '../../../../core/services/notification.service';

const blankAddress = {
  firstName: '',
  lastName: '',
  emailAddress: '',
  addressLine: '',
  country: '',
  state: '',
  zipCode: ''
};

const emptyGuid = '00000000-0000-0000-0000-000000000000';

@Component({
  selector: 'app-order-form',
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
    MatTableModule,
    LoadingSpinner
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-form.html',
  styles: [`
    .form-card { max-width: 960px; }
    h3 { margin: 24px 0 8px; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: .5px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .items table { width: 100%; }
    .items mat-form-field { width: 100%; }
    .items th, .items td { padding: 4px; }
    .add-item { margin: 8px 0 16px; }
  `]
})
export class OrderForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(OrderService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly notify = inject(NotificationService);

  readonly orderName = input<string | undefined>();

  protected readonly orderStatus = OrderStatus;
  protected readonly statusOptions = [
    { value: OrderStatus.Draft, label: 'Draft' },
    { value: OrderStatus.Pending, label: 'Pending' },
    { value: OrderStatus.Completed, label: 'Completed' },
    { value: OrderStatus.Cancelled, label: 'Cancelled' }
  ];
  protected readonly itemColumns = ['productId', 'quantity', 'price', 'remove'];

  protected readonly editMode = computed(() => !!this.orderName());
  protected readonly initializing = signal(false);
  protected readonly submitting = signal(false);
  private editingId: string | null = null;

  protected readonly form: FormGroup = this.fb.group({
    customerId: [emptyGuid, [Validators.required]],
    orderName: ['', [Validators.required]],
    status: [OrderStatus.Pending, [Validators.required]],
    shippingAddress: this.buildAddressGroup(),
    billingAddress: this.buildAddressGroup(),
    payment: this.fb.group({
      cardName: ['', [Validators.required]],
      cardNumber: ['', [Validators.required]],
      expiration: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      paymentMethod: [1, [Validators.required]]
    }),
    orderItems: this.fb.array<FormGroup>([])
  });

  get items(): FormArray<FormGroup> {
    return this.form.get('orderItems') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    if (!this.editMode()) {
      this.addItem();
      return;
    }

    const fromState = (history.state?.['order'] as OrderDto | undefined) ?? null;
    if (fromState) {
      this.patchFromOrder(fromState);
      return;
    }

    this.initializing.set(true);
    this.service.byName(this.orderName()!).subscribe({
      next: (orders) => {
        this.initializing.set(false);
        if (orders.length === 0) {
          this.notify.error('Order not found.');
          this.router.navigate(['/ordering/orders']);
          return;
        }
        this.patchFromOrder(orders[0]);
      },
      error: () => {
        this.initializing.set(false);
        this.router.navigate(['/ordering/orders']);
      }
    });
  }

  protected addItem(productId = '', quantity = 1, price = 0): void {
    this.items.push(this.fb.group({
      productId: [productId, [Validators.required]],
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      price: [price, [Validators.required, Validators.min(0)]]
    }));
  }

  protected removeItem(index: number): void {
    this.items.removeAt(index);
  }

  protected submit(): void {
    if (this.form.invalid || this.items.length === 0) return;
    const v = this.form.getRawValue();

    const payload: OrderDto = {
      id: this.editingId ?? emptyGuid,
      customerId: v.customerId,
      orderName: v.orderName,
      status: Number(v.status),
      shippingAddress: { ...v.shippingAddress },
      billingAddress: { ...v.billingAddress },
      payment: {
        cardName: v.payment.cardName,
        cardNumber: v.payment.cardNumber,
        expiration: v.payment.expiration,
        cvv: v.payment.cvv,
        paymentMethod: Number(v.payment.paymentMethod)
      },
      orderItems: v.orderItems.map((it: { productId: string; quantity: number; price: number }) => ({
        orderId: this.editingId ?? emptyGuid,
        productId: it.productId,
        quantity: Number(it.quantity),
        price: Number(it.price)
      }))
    };

    this.submitting.set(true);

    if (this.editMode() && this.editingId) {
      this.service.update(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.notify.success('Order updated.');
          this.router.navigate(['/ordering/orders', payload.orderName], { state: { order: payload } });
        },
        error: () => this.submitting.set(false)
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.submitting.set(false);
          this.notify.success('Order created.');
          this.router.navigate(['/ordering/orders']);
        },
        error: () => this.submitting.set(false)
      });
    }
  }

  protected cancel(): void {
    this.location.back();
  }

  private buildAddressGroup(): FormGroup {
    return this.fb.group({
      firstName: [blankAddress.firstName, [Validators.required]],
      lastName: [blankAddress.lastName, [Validators.required]],
      emailAddress: [blankAddress.emailAddress],
      addressLine: [blankAddress.addressLine, [Validators.required]],
      country: [blankAddress.country, [Validators.required]],
      state: [blankAddress.state, [Validators.required]],
      zipCode: [blankAddress.zipCode, [Validators.required]]
    });
  }

  private patchFromOrder(o: OrderDto): void {
    this.editingId = o.id;
    this.form.patchValue({
      customerId: o.customerId,
      orderName: o.orderName,
      status: o.status,
      shippingAddress: o.shippingAddress,
      billingAddress: o.billingAddress,
      payment: o.payment
    });
    this.items.clear();
    for (const it of o.orderItems) this.addItem(it.productId, it.quantity, it.price);
  }
}
