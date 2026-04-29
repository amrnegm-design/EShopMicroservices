import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'angular-shop.current-user';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  readonly userName = signal<string | null>(this.read());

  set(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    this.userName.set(trimmed);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.userName.set(null);
  }

  private read(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
