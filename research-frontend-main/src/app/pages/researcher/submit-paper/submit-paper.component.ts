import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ResearcherService } from '@core/services/researcher.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { SnackbarService } from '@shared/services/snackbar.service';
import { PaperSubmissionResponse } from '@core/models';

@Component({
  selector: 'app-submit-paper',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './submit-paper.component.html',
  styleUrl: './submit-paper.component.scss'
})
export class SubmitPaperComponent {
  private readonly fb = inject(FormBuilder);
  private readonly researcherService = inject(ResearcherService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly snackbar = inject(SnackbarService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(300)]],
    abstractText: ['', [Validators.required, Validators.maxLength(3000)]]
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && file.type !== 'application/pdf') {
      this.fileError.set('Only PDF files are accepted.');
      this.selectedFile.set(null);
      return;
    }

    if (file && file.size > 25 * 1024 * 1024) {
      this.fileError.set('File must be smaller than 25MB.');
      this.selectedFile.set(null);
      return;
    }

    this.fileError.set(null);
    this.selectedFile.set(file);
  }

  removeFile(): void {
    this.selectedFile.set(null);
  }

  submit(): void {
    const file = this.selectedFile();
    if (this.form.invalid || !file) {
      this.form.markAllAsTouched();
      if (!file) this.fileError.set('Please attach your manuscript PDF.');
      return;
    }

    const user = this.tokenStorage.getUser();
    if (!user) {
      this.snackbar.error('Your session has expired. Please sign in again.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.submitting.set(true);
    const { title, abstractText } = this.form.getRawValue();

    this.researcherService.submitPaper(
      title,
      abstractText,
      user.id,
      file
    ).subscribe({
      next: (response: PaperSubmissionResponse) => {
        this.submitting.set(false);
        this.snackbar.success('Paper submitted successfully.');
        this.router.navigate(['/researcher/papers', response.paperId]);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.snackbar.error(error.error?.message ?? 'Failed to submit paper.');
      }
    });
  }
}
