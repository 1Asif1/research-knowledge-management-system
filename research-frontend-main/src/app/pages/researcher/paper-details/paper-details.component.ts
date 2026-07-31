import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

import { ResearcherService } from '@core/services/researcher.service';
import { ReviewerService } from '@core/services/reviewer.service';
import { PaperSubmissionResponse, ReviewCommentResponse, reviewStatusIntent, reviewStatusLabel } from '@core/models';

import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { TimelineComponent, TimelineStep } from '@shared/components/timeline/timeline.component';
import { SnackbarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-paper-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    TimelineComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paper-details.component.html',
  styleUrl: './paper-details.component.scss'
})
export class PaperDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly researcherService = inject(ResearcherService);
  private readonly reviewerService = inject(ReviewerService);
  private readonly snackbar = inject(SnackbarService);

  readonly loading = signal(true);
  readonly downloading = signal(false);
  readonly paper = signal<PaperSubmissionResponse | null>(null);
  readonly comments = signal<ReviewCommentResponse[]>([]);
  readonly commentsUnavailable = signal(false);
  readonly reviewStatusLabel = reviewStatusLabel;
  readonly reviewStatusIntent = reviewStatusIntent;

  readonly timelineSteps: TimelineStep[] = [];

  paperId!: number;

  ngOnInit(): void {
    this.paperId = Number(this.route.snapshot.paramMap.get('paperId'));

    this.researcherService.getSubmission(this.paperId).subscribe({
      next: (data) => {
        this.paper.set(data);
        this.loading.set(false);

        if (data.reviewId) {
          this.commentsUnavailable.set(false);
          this.reviewerService.getComments(data.reviewId).subscribe({
            next: (comments) => this.comments.set(comments),
            error: () => this.commentsUnavailable.set(true)
          });
          return;
        }

        this.commentsUnavailable.set(true);
      },
      error: () => this.loading.set(false)
    });
  }

  downloadCurrentVersion(): void {
    const paper = this.paper();
    if (!paper || this.downloading()) {
      return;
    }

    this.downloading.set(true);
    this.researcherService.downloadCurrentPaperPdf(paper.paperId).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.downloading.set(false);
          this.snackbar.error('Failed to download paper.');
          return;
        }

        const fileName = this.resolveFileName(response.headers, paper.title);
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
        this.downloading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.downloading.set(false);
        this.handleDownloadError(error);
      }
    });
  }

  private handleDownloadError(error: HttpErrorResponse): void {
    const maybeBlob = error.error;
    if (maybeBlob instanceof Blob) {
      maybeBlob.text()
        .then((text) => {
          try {
            const parsed = JSON.parse(text) as { message?: string };
            this.snackbar.error(parsed.message ?? 'Failed to download paper.');
          } catch {
            this.snackbar.error('Failed to download paper.');
          }
        })
        .catch(() => this.snackbar.error('Failed to download paper.'));
      return;
    }

    this.snackbar.error(error.error?.message ?? 'Failed to download paper.');
  }

  private resolveFileName(headers: HttpHeaders, paperTitle: string): string {
    const contentDisposition = headers.get('content-disposition') ?? '';
    const fileNameMatch = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
    if (fileNameMatch && fileNameMatch[1]) {
      return fileNameMatch[1];
    }

    return `${this.slugify(paperTitle)}.pdf`;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'paper';
  }
}
