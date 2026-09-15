import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { BrandMarkComponent } from '../../shared/brand-mark/brand-mark.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, BrandMarkComponent],
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

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
