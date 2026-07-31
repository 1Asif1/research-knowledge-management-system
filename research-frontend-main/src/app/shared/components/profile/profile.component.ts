import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '@core/services/user.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { roleDisplayName } from '@core/models';
import { SnackbarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-researcher-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly snackbar = inject(SnackbarService);

  readonly user = this.tokenStorage.user;
  readonly roleLabel = roleDisplayName;
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    firstName: [this.user()?.firstName ?? '', [Validators.required]],
    lastName: [this.user()?.lastName ?? '', [Validators.required]]
  });

  get initials(): string {
    const u = this.user();
    if (!u) return '?';
    return `${u.firstName?.charAt(0) ?? ''}${u.lastName?.charAt(0) ?? ''}`.toUpperCase();
  }

  save(): void {
    const u = this.user();
    if (this.form.invalid || !u) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const { firstName, lastName } = this.form.getRawValue();

    this.userService.updateUser(u.id, { firstName, lastName }).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackbar.success('Profile updated successfully.');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        this.snackbar.error(error.error?.message ?? 'Failed to update profile.');
      }
    });
  }
}
