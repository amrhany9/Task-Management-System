import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
}

const DEFAULT_DURATION_MS = 4000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private nextId = 1;

  readonly toasts = this.toastsSignal.asReadonly();

  success(message: string, title?: string): void {
    this.push('success', message, title);
  }

  error(message: string, title?: string): void {
    this.push('error', message, title);
  }

  info(message: string, title?: string): void {
    this.push('info', message, title);
  }

  warning(message: string, title?: string): void {
    this.push('warning', message, title);
  }

  remove(id: number): void {
    this.toastsSignal.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private push(type: ToastType, message: string, title?: string): void {
    const id = this.nextId++;
    this.toastsSignal.update((toasts) => [...toasts, { id, type, message, title }]);

    setTimeout(() => this.remove(id), DEFAULT_DURATION_MS);
  }
}
