import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BrandMarkComponent } from '../../../shared/brand-mark/brand-mark.component';
import { GoogleSignInButtonComponent } from '../../../shared/google-sign-in-button/google-sign-in-button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, BrandMarkComponent, GoogleSignInButtonComponent],
  templateUrl: './register.component.html',
  // router-outlet renders this as a sibling element, so without an explicit
  // display it stays inline and shrink-wraps, ignoring the card's max-width.
  host: { class: 'block w-full' }
})
export class RegisterComponent {
  private readonly notificationService = inject(NotificationService);

  name = '';
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

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.notificationService.success('Account created');
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Unable to register. Please try again.');
      }
    });
  }

  signUpWithGoogle(idToken: string): void {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.googleSignIn({ idToken }).subscribe({
      next: () => {
        this.notificationService.success('Account created');
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Unable to sign up with Google. Please try again.');
      }
    });
  }

  onGoogleUnavailable(message: string): void {
    this.errorMessage.set(message);
  }
}
