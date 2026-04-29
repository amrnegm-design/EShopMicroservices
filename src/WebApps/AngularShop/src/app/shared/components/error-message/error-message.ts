import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: #fee2e2;
      color: #991b1b;
      border-radius: 6px;
      margin: 16px 0;
    }
  `],
  template: `<mat-icon>error_outline</mat-icon><span>{{ message() }}</span>`
})
export class ErrorMessage {
  readonly message = input.required<string>();
}
