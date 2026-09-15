import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Minimal typings for the slice of Google Identity Services this app uses. */
export interface GoogleCredentialResponse {
  credential: string;
}

export interface GoogleButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'small' | 'medium' | 'large';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  width?: number;
  logo_alignment?: 'left' | 'center';
}

interface GoogleIdentityApi {
  initialize(config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }): void;
  renderButton(parent: HTMLElement, options: GoogleButtonOptions): void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdentityApi } };
  }
}

const READY_POLL_INTERVAL_MS = 50;
const READY_TIMEOUT_MS = 10000;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  /**
   * The GIS script is loaded `async defer`, so it may not be present when a
   * component initialises. Resolves once the API is usable.
   */
  async waitUntilReady(): Promise<GoogleIdentityApi> {
    const deadline = Date.now() + READY_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const api = window.google?.accounts?.id;
      if (api) {
        return api;
      }

      await new Promise((resolve) => setTimeout(resolve, READY_POLL_INTERVAL_MS));
    }

    throw new Error('Google Identity Services failed to load.');
  }

  async initialize(callback: (response: GoogleCredentialResponse) => void): Promise<void> {
    const api = await this.waitUntilReady();
    api.initialize({ client_id: environment.googleClientId, callback });
  }

  async renderButton(parent: HTMLElement, options: GoogleButtonOptions): Promise<void> {
    const api = await this.waitUntilReady();
    api.renderButton(parent, options);
  }
}
