import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Centralized snackbar wrapper for success/info toasts. The error.interceptor
// (Feature 4) handles failure toasts globally — this covers the "happy path"
// confirmations pages trigger explicitly (e.g. "Paper submitted successfully").
@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 4000,
      panelClass: ['rkm-snackbar', 'rkm-snackbar--success']
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 4000,
      panelClass: ['rkm-snackbar', 'rkm-snackbar--info']
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: ['rkm-snackbar', 'rkm-snackbar--danger']
    });
  }
}
