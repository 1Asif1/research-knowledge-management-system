import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '@core/services/token-storage.service';

// Handles 401 / 403 / 500 globally, per spec:
// "Handle 401, 403, 500. Redirect to Login if unauthorized."
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          tokenStorage.clearSession();
          snackBar.open('Your session has expired. Please sign in again.', 'Dismiss', { duration: 5000 });
          router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
          break;

        case 403:
          snackBar.open('You do not have permission to perform this action.', 'Dismiss', { duration: 5000 });
          break;

        case 500:
        case 502:
        case 503:
          snackBar.open('Something went wrong on our end. Please try again shortly.', 'Dismiss', { duration: 5000 });
          break;

        case 0:
          snackBar.open('Unable to reach the server. Check your connection.', 'Dismiss', { duration: 5000 });
          break;

        default: {
          const message = (error.error && (error.error.message || error.error)) || 'An unexpected error occurred.';
          snackBar.open(typeof message === 'string' ? message : 'An unexpected error occurred.', 'Dismiss', {
            duration: 5000
          });
        }
      }

      return throwError(() => error);
    })
  );
};
