import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
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
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword({ email: this.form.getRawValue().email }).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.status === 404
            ? 'Password reset isn\u2019t available yet — contact your administrator.'
            : 'Something went wrong. Please try again.'
        );
      }
    });
  }
}
