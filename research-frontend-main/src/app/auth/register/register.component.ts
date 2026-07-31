import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Role } from '@core/models';
import { UserService } from '@core/services/user.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value as string | undefined;
  const confirmPassword = control.get('confirmPassword')?.value as string | undefined;
  if (!password || !confirmPassword) {
    return null;
  }
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    },
    { validators: passwordsMatchValidator }
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { firstName, lastName, email, password } = this.form.getRawValue();

    this.userService
      .createUser({
        firstName,
        lastName,
        email,
        password,
        role: Role.RESEARCHER
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Account created. Please sign in with your new credentials.');
          this.form.reset();
          setTimeout(() => this.router.navigate(['/auth/login']), 900);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          if (error.status === 409) {
            this.errorMessage.set('This email is already registered.');
            return;
          }
          if (error.status === 0) {
            this.errorMessage.set('Backend is unreachable. Start auth and user services first.');
            return;
          }
          this.errorMessage.set('Registration failed. Please try again.');
        }
      });
  }
}
