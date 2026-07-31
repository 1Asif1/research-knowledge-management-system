import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '@core/services/auth.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hideNewPassword = signal(true);
  readonly hideConfirmPassword = signal(true);

  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly form = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      if (!this.token) {
        this.errorMessage.set('This reset link is invalid or missing a token.');
      }
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService
      .resetPassword({ token: this.token, newPassword: this.form.getRawValue().newPassword })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.submitted.set(true);
          setTimeout(() => this.router.navigate(['/auth/login']), 2500);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(
            error.status === 404
              ? 'Password reset isn\u2019t available yet — contact your administrator.'
              : 'This link may have expired. Please request a new one.'
          );
        }
      });
  }
}
