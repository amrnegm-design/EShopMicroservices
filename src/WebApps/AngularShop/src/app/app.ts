import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-main-layout><router-outlet /></app-main-layout>`
})
export class App {}
