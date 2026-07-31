import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '@core/services/token-storage.service';

// Functional interceptor (Angular 15+/20 style) — attaches the JWT to every
// outgoing request automatically, per spec: "Automatically attach JWT using
// HTTP Interceptor."
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const token = tokenStorage.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });

  return next(authReq);
};
