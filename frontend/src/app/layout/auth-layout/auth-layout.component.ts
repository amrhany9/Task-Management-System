import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Chrome-free shell for the auth routes: no navbar, full-page centred canvas.
 * Keeps the theme toggle reachable before sign-in.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent {
  protected readonly themeService = inject(ThemeService);
}
