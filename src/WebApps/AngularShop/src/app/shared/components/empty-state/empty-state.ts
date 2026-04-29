import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host { display: block; padding: 48px 16px; text-align: center; color: #64748b; }
    mat-icon { font-size: 56px; height: 56px; width: 56px; margin-bottom: 12px; opacity: .6; }
    h3 { margin: 8px 0 4px; font-weight: 500; }
    p { margin: 0; }
  `],
  template: `
    <mat-icon>{{ icon() }}</mat-icon>
    <h3>{{ title() }}</h3>
    @if (message()) { <p>{{ message() }}</p> }
    <ng-content />
  `
})
export class EmptyState {
  readonly icon = input<string>('inbox');
  readonly title = input.required<string>();
  readonly message = input<string | null>(null);
}
