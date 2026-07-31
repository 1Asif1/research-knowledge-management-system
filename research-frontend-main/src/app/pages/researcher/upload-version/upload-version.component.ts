import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { ResearcherService } from '@core/services/researcher.service';
import { SnackbarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-upload-version',
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
  templateUrl: './upload-version.component.html',
  styleUrl: './upload-version.component.scss'
})
export class UploadVersionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly researcherService = inject(ResearcherService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);

  readonly paperId = Number(this.route.snapshot.paramMap.get('paperId'));
  readonly submitting = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    changeSummary: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (file && file.type !== 'application/pdf') {
      this.fileError.set('Only PDF files are accepted.');
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
      if (!file) this.fileError.set('Please attach the corrected manuscript PDF.');
      return;
    }

    this.submitting.set(true);
    const { changeSummary } = this.form.getRawValue();

    this.researcherService
      .uploadNewVersion(this.paperId, {
        fileName: file.name,
        filePath: `/uploads/${file.name}`,
        changeSummary
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackbar.success('New version uploaded successfully.');
          this.router.navigate(['/researcher/papers', this.paperId]);
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.snackbar.error(error.error?.message ?? 'Failed to upload new version.');
        }
      });
  }
}
