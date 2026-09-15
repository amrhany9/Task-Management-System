import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BrandMarkComponent } from '../../../shared/brand-mark/brand-mark.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, BrandMarkComponent],
  templateUrl: './login.component.html',
  // router-outlet renders this as a sibling element, so without an explicit
  // display it stays inline and shrink-wraps, ignoring the card's max-width.
  host: { class: 'block w-full' }
})
export class LoginComponent {
  private readonly notificationService = inject(NotificationService);

  email = '';
  password = '';
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.notificationService.success('Logged in successfully');
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Unable to log in. Please try again.');
      }
    });
  }
}
