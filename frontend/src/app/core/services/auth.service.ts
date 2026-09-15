import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, GoogleSignInRequest, LoginRequest, RegisterRequest } from '../models/user.model';

const STORAGE_KEY = 'tms.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AuthUser | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor(private readonly http: HttpClient) {}

  get token(): string | null {
    return this.currentUserSignal()?.token ?? null;
  }

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${environment.apiBaseUrl}/auth/register`, request)
      .pipe(tap((user) => this.setSession(user)));
  }

  login(request: LoginRequest): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${environment.apiBaseUrl}/auth/login`, request)
      .pipe(tap((user) => this.setSession(user)));
  }

  /** Exchanges a Google ID token for this app's own session token. */
  googleSignIn(request: GoogleSignInRequest): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(`${environment.apiBaseUrl}/auth/google`, request)
      .pipe(tap((user) => this.setSession(user)));
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.currentUserSignal.set(null);
  }

  private setSession(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
