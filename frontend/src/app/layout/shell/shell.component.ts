import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  protected readonly themeService = inject(ThemeService);

  readonly isMenuOpen = signal(false);

  readonly userInitials = computed(() => {
    const name = this.authService.currentUser()?.name ?? '';

    return name
      .split(' ')
      .filter((part) => part.length > 0)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  });

  constructor(
    protected readonly authService: AuthService,
    private readonly router: Router
  ) {}

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  logout(): void {
    this.isMenuOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
