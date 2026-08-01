import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { EditorService } from '@core/services/editor.service';
import { PaperService } from '@core/services/paper.service';

import {
  PaperResponse,
  PublicationResponse,
  ReviewProcessResponse
} from '@core/models';

import { SnackbarService } from
  '@shared/services/snackbar.service';

import { LoadingSpinnerComponent } from
  '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-publish-paper',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './publish-paper.component.html',
  styleUrl: './publish-paper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublishPaperComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  private readonly editorService = inject(EditorService);
  private readonly paperService = inject(PaperService);
  private readonly snackbar = inject(SnackbarService);

  readonly loading = signal(true);
  readonly publishing = signal(false);
  readonly errorMessage = signal('');

  readonly review = signal<ReviewProcessResponse | null>(null);
  readonly paper = signal<PaperResponse | null>(null);
  readonly publication =
    signal<PublicationResponse | null>(null);

  readonly publicationForm = this.formBuilder.nonNullable.group({
    publishedDate: [
      this.getToday(),
      Validators.required
    ]
  });

  readonly isAccepted = computed(() => {
    return (
      this.normalise(this.review()?.editorDecision) ===
      'ACCEPT'
    );
  });

  readonly isAlreadyPublished = computed(() => {
    return (
      this.normalise(this.paper()?.status) ===
      'PUBLISHED'
    );
  });

  readonly canPublish = computed(() => {
    return (
      this.isAccepted() &&
      !this.isAlreadyPublished() &&
      !this.publishing()
    );
  });

  ngOnInit(): void {
    const reviewId = Number(
      this.route.snapshot.paramMap.get('reviewId')
    );

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      this.errorMessage.set('Invalid review ID.');
      this.loading.set(false);
      return;
    }

    this.loadPublicationData(reviewId);
  }

  loadPublicationData(reviewId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.editorService.getReview(reviewId).subscribe({
      next: (review) => {
        this.review.set(review);
        this.loadPaper(review);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load review:', error);

        this.errorMessage.set(
          error.error?.message ??
            'Unable to load review details.'
        );

        this.loading.set(false);
      }
    });
  }

  private loadPaper(
    review: ReviewProcessResponse
  ): void {
    this.paperService
      .getPaperById(review.paperId)
      .subscribe({
        next: (paper) => {
          this.paper.set(paper);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Failed to load paper:', error);

          this.errorMessage.set(
            error.error?.message ??
              'The review was found, but the paper details could not be loaded.'
          );

          this.loading.set(false);
        }
      });
  }

  publishPaper(): void {
    const review = this.review();
    const paper = this.paper();

    if (!review || !paper) {
      this.snackbar.error(
        'Paper information is unavailable.'
      );
      return;
    }

    if (!this.isAccepted()) {
      this.snackbar.error(
        'Only accepted papers can be published.'
      );
      return;
    }

    if (this.isAlreadyPublished()) {
      this.snackbar.error(
        'This paper has already been published.'
      );
      return;
    }

    if (this.publicationForm.invalid) {
      this.publicationForm.markAllAsTouched();
      return;
    }

    const { publishedDate } =
      this.publicationForm.getRawValue();

    this.publishing.set(true);

    this.paperService.publishPaper({
      paperId: paper.id,
      publishedDate
    }).subscribe({
      next: (publication) => {
        this.publication.set(publication);

        this.paper.update((currentPaper) =>
          currentPaper
            ? {
                ...currentPaper,
                status: 'PUBLISHED'
              }
            : currentPaper
        );

        this.publishing.set(false);

        this.snackbar.success(
          'Paper published successfully.'
        );
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to publish paper:', error);

        this.publishing.set(false);

        this.snackbar.error(
          error.error?.message ??
            error.error?.detail ??
            'Unable to publish the paper.'
        );
      }
    });
  }

  getPaperTitle(): string {
    return (
      this.paper()?.title?.trim() ||
      this.review()?.paperTitle?.trim() ||
      `Paper #${this.review()?.paperId ?? ''}`
    );
  }

  formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'Not available';
    }

    const text = String(value).trim();

    if (!text) {
      return 'Not available';
    }

    return text
      .toLowerCase()
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  }

  goBack(): void {
    this.router.navigate(['/editor/decisions']);
  }

  goToPapers(): void {
    this.router.navigate(['/editor/papers']);
  }

  private getToday(): string {
    const today = new Date();
    const localDate = new Date(
      today.getTime() -
        today.getTimezoneOffset() * 60_000
    );

    return localDate.toISOString().slice(0, 10);
  }

  private normalise(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim().toUpperCase();
  }
}
