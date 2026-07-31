import { Injectable, signal, computed } from '@angular/core';
import { environment } from '@env/environment';
import { CurrentUser } from '@core/models';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  // Signals are the single source of truth for auth state across the app —
  // navbar, sidebar, guards, and interceptors all read from here.
  private readonly _token = signal<string | null>(this.readToken());
  private readonly _user = signal<CurrentUser | null>(this.readUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  setSession(token: string, user: CurrentUser): void {
    localStorage.setItem(environment.tokenStorageKey, token);
    localStorage.setItem(environment.userStorageKey, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  clearSession(): void {
    localStorage.removeItem(environment.tokenStorageKey);
    localStorage.removeItem(environment.userStorageKey);
    this._token.set(null);
    this._user.set(null);
  }

  getToken(): string | null {
    return this._token();
  }

  getUser(): CurrentUser | null {
    return this._user();
  }

  private readToken(): string | null {
    return localStorage.getItem(environment.tokenStorageKey);
  }

  private readUser(): CurrentUser | null {
    const raw = localStorage.getItem(environment.userStorageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  }
}
