import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: flex; align-items: center; justify-content: center; padding: 48px; gap: 12px; color: #64748b; }
  `],
  template: `
    <mat-spinner [diameter]="32" />
    <span>{{ message() }}</span>
  `
})
export class LoadingSpinner {
  readonly message = input<string>('Loading…');
}
