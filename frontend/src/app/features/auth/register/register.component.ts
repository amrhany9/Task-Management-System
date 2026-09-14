import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
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
      next: () => this.router.navigate(['/projects']),
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message ?? 'Unable to register. Please try again.');
      }
    });
  }
}
