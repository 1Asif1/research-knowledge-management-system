import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { TokenStorageService } from './token-storage.service';
import { LoginRequest, LoginResponse, ValidateTokenResponse, CurrentUser } from '@core/models';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly baseUrl = environment.apiUrls.auth;

  readonly currentUser = this.tokenStorage.user;
  readonly isAuthenticated = this.tokenStorage.isAuthenticated;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) => {
        const user: CurrentUser = {
          id: response.uuid,
          firstName: response.firstname,
          lastName: response.lastname,
          email: response.email,
          role: response.role
        };
        this.tokenStorage.setSession(response.token, user);
      })
    );
  }

  validateToken(token: string): Observable<ValidateTokenResponse> {
    return this.http.post<ValidateTokenResponse>(`${this.baseUrl}/validate`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // NOTE: not yet implemented on AuthController — add
  // POST /auth/forgot-password to AuthServiceD when ready.
  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/forgot-password`, request);
  }

  // NOTE: not yet implemented on AuthController — add
  // POST /auth/reset-password to AuthServiceD when ready.
  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/reset-password`, request);
  }

  logout(): void {
    this.tokenStorage.clearSession();
  }

  getCurrentUser(): CurrentUser | null {
    return this.tokenStorage.getUser();
  }
}
