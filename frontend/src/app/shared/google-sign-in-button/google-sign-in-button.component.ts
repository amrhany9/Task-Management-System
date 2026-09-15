import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Wraps Google's own rendered button. Google's branding guidelines require their
 * styling, and the ID-token flow offers no supported way to trigger the credential
 * popup from a custom element, so this is deliberately not a `.btn-*` button.
 */
@Component({
  selector: 'app-google-sign-in-button',
  standalone: true,
  templateUrl: './google-sign-in-button.component.html',
  // Without an explicit display the custom element stays inline and shrink-wraps.
  host: { class: 'block w-full' }
})
export class GoogleSignInButtonComponent implements AfterViewInit {
  private readonly googleAuthService = inject(GoogleAuthService);
  private readonly themeService = inject(ThemeService);
  private readonly zone = inject(NgZone);

  @Input() mode: 'signin' | 'signup' = 'signin';
  @Input() disabled = false;

  @Output() credential = new EventEmitter<string>();
  @Output() failed = new EventEmitter<string>();

  @ViewChild('buttonHost') buttonHost?: ElementRef<HTMLDivElement>;

  readonly isReady = signal(false);

  private initialized = false;

  constructor() {
    // The rendered button's theme is fixed at render time, so re-render when the
    // app theme changes.
    effect(() => {
      this.themeService.theme();

      if (this.initialized) {
        void this.render();
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.googleAuthService.initialize((response) => {
        // The GIS callback fires outside Angular's zone; without this the signal
        // updates in the parent would not trigger change detection.
        this.zone.run(() => this.credential.emit(response.credential));
      });

      this.initialized = true;
      await this.render();
      this.zone.run(() => this.isReady.set(true));
    } catch {
      this.zone.run(() => this.failed.emit('Google sign-in is unavailable right now.'));
    }
  }

  private async render(): Promise<void> {
    const host = this.buttonHost?.nativeElement;
    if (!host) {
      return;
    }

    host.innerHTML = '';

    await this.googleAuthService.renderButton(host, {
      theme: this.themeService.theme() === 'dark' ? 'filled_black' : 'outline',
      size: 'large',
      shape: 'rectangular',
      text: this.mode === 'signup' ? 'signup_with' : 'signin_with',
      logo_alignment: 'center',
      width: 360
    });
  }
}
