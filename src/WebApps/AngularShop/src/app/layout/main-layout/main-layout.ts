import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatProgressBarModule, Navbar, Sidebar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./main-layout.scss'],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <app-sidebar />
      </mat-sidenav>
      <mat-sidenav-content>
        <app-navbar />
        @if (loading.active()) {
          <mat-progress-bar mode="indeterminate" class="top-bar" />
        }
        <main class="content"><ng-content /></main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `
})
export class MainLayout {
  protected readonly loading = inject(LoadingService);
}
