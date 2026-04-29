import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private inflight = 0;
  readonly active = signal(false);

  start(): void {
    this.inflight++;
    if (this.inflight === 1) this.active.set(true);
  }

  stop(): void {
    if (this.inflight > 0) this.inflight--;
    if (this.inflight === 0) this.active.set(false);
  }
}
