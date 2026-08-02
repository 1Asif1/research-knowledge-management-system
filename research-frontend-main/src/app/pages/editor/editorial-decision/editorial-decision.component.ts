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

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

import { EditorService } from '@core/services/editor.service';

import {
  EditorDecision,
  ReviewProcessResponse
} from '@core/models';

import { SnackbarService } from
    '@shared/services/snackbar.service';

import { LoadingSpinnerComponent } from
    '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-editorial-decision',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './editorial-decision.component.html',
  styleUrl: './editorial-decision.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorialDecisionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly editorService = inject(EditorService);
  private readonly snackbar = inject(SnackbarService);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly review =
    signal<ReviewProcessResponse | null>(null);

  readonly decisionForm = this.formBuilder.group({
    decision: [
      null as EditorDecision | null,
      Validators.required
    ]
  });

  readonly hasReviewerRecommendation = computed(() => {
    const recommendation =
      this.review()?.reviewerRecommendation;

    if (
      recommendation === null ||
      recommendation === undefined
    ) {
      return false;
    }

    const normalizedRecommendation =
      String(recommendation)
        .trim()
        .toUpperCase();

    return (
      normalizedRecommendation !== '' &&
      normalizedRecommendation !== 'PENDING'
    );
  });

  readonly hasFinalDecision = computed(() => {
    const decision =
      this.review()?.editorDecision;

    if (
      decision === null ||
      decision === undefined
    ) {
      return false;
    }

    const normalizedDecision =
      String(decision)
        .trim()
        .toUpperCase();

    return (
      normalizedDecision !== '' &&
      normalizedDecision !== 'PENDING'
    );
  });

  readonly canMakeFinalDecision = computed(() => {
    return (
      this.hasReviewerRecommendation() &&
      !this.hasFinalDecision() &&
      !this.submitting()
    );
  });

  ngOnInit(): void {
    const reviewId = Number(
      this.route.snapshot.paramMap.get('reviewId')
    );

    if (
      !Number.isInteger(reviewId) ||
      reviewId <= 0
    ) {
      this.errorMessage.set('Invalid review ID.');
      this.loading.set(false);
      return;
    }

    this.loadReview(reviewId);
  }

  loadReview(reviewId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.editorService
      .getReview(reviewId)
      .subscribe({
        next: (review) => {
          this.review.set(review);

          const existingDecision =
            this.normalise(
              review.editorDecision
            );

          const recommendation =
            this.normalise(
              review.reviewerRecommendation
            );

          if (
            existingDecision === 'ACCEPT' ||
            existingDecision === 'REJECT'
          ) {
            this.decisionForm.patchValue({
              decision:
                existingDecision as EditorDecision
            });

            this.decisionForm.disable();
          } else if (
            recommendation === '' ||
            recommendation === 'PENDING'
          ) {
            /*
             * Reviewer has not submitted a recommendation.
             * The editor must not make a final decision yet.
             */
            this.decisionForm.reset();
            this.decisionForm.disable();
          } else {
            /*
             * Recommendation exists and no final decision
             * has been submitted yet.
             */
            this.decisionForm.enable();
          }

          this.loading.set(false);
        },

        error: (error) => {
          console.error(
            'Failed to load review:',
            error
          );

          this.errorMessage.set(
            error.error?.message ??
            error.error?.detail ??
            'Unable to load review details.'
          );

          this.loading.set(false);
        }
      });
  }

  submitDecision(): void {
    const review = this.review();

    if (!review) {
      this.snackbar.error(
        'Review information is unavailable.'
      );
      return;
    }

    if (!this.hasReviewerRecommendation()) {
      this.snackbar.error(
        'The reviewer must submit a recommendation before you can make a final decision.'
      );
      return;
    }

    if (this.hasFinalDecision()) {
      this.snackbar.error(
        'A final editorial decision has already been submitted.'
      );
      return;
    }

    if (this.decisionForm.invalid) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    const decision =
      this.decisionForm.controls.decision.value;

    if (!decision) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.decisionForm.disable();

    this.editorService
      .makeFinalDecision(
        review.reviewId,
        { decision }
      )
      .subscribe({
        next: (updatedReview) => {
          this.review.set(updatedReview);
          this.submitting.set(false);
          this.decisionForm.disable();

          this.snackbar.success(
            'Editorial decision submitted successfully.'
          );

          this.router.navigate([
            '/editor/decisions'
          ]);
        },

        error: (error) => {
          console.error(
            'Failed to submit editorial decision:',
            error
          );

          this.submitting.set(false);

          /*
           * Re-enable only when the review is still eligible
           * for a decision.
           */
          if (
            this.hasReviewerRecommendation() &&
            !this.hasFinalDecision()
          ) {
            this.decisionForm.enable();
          }

          const message =
            error.error?.message ??
            error.error?.detail ??
            (
              typeof error.error === 'string'
                ? error.error
                : null
            ) ??
            'Unable to submit the editorial decision.';

          this.snackbar.error(message);
        }
      });
  }

  getPaperTitle(): string {
    const review = this.review();

    return (
      review?.paperTitle?.trim() ||
      `Paper #${review?.paperId ?? ''}`
    );
  }

  isCompleted(): boolean {
    return this.hasFinalDecision();
  }

  formatValue(value: unknown): string {
    if (
      value === null ||
      value === undefined
    ) {
      return 'Pending';
    }

    const text = String(value).trim();

    if (!text) {
      return 'Pending';
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
    this.router.navigate([
      '/editor/decisions'
    ]);
  }

  private normalise(value: unknown): string {
    if (
      value === null ||
      value === undefined
    ) {
      return '';
    }

    return String(value)
      .trim()
      .toUpperCase();
  }
}
