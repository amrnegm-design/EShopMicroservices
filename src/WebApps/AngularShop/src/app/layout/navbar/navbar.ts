import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    mat-toolbar { background: #0f172a; color: white; }
    .grow { flex: 1; }
    .mode-tag {
      font-size: 12px;
      padding: 2px 10px;
      border-radius: 12px;
      background: #334155;
      margin-left: 12px;
      letter-spacing: .5px;
      text-transform: uppercase;
    }
  `],
  template: `
    <mat-toolbar>
      <a mat-button routerLink="/dashboard"><mat-icon>storefront</mat-icon> &nbsp; eShop Demo</a>
      <span class="mode-tag">{{ mode }}</span>
      <span class="grow"></span>
      <a mat-button routerLink="/basket"><mat-icon>shopping_cart</mat-icon> Basket</a>
      <a mat-button routerLink="/ordering/orders"><mat-icon>receipt_long</mat-icon> Orders</a>
    </mat-toolbar>
  `
})
export class Navbar {
  protected readonly mode = environment.mode;
}
