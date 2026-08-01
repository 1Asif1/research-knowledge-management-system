import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { ReviewerService } from '@core/services/reviewer.service';
import { PaperService } from '@core/services/paper.service';
import { TokenStorageService } from '@core/services/token-storage.service';

import {
  PaperResponse,
  ReviewCommentResponse,
  ReviewProcessResponse,
  ReviewerRecommendation
} from '@core/models';

import { LoadingSpinnerComponent } from
  '@shared/components/loading-spinner/loading-spinner.component';

interface RecommendationOption {
  value: ReviewerRecommendation;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-review-paper',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './review-paper.component.html',
  styleUrl: './review-paper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewPaperComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  private readonly reviewerService = inject(ReviewerService);
  private readonly paperService = inject(PaperService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly loading = signal(true);
  readonly loadingContent = signal(false);
  readonly submittingComment = signal(false);
  readonly submittingRecommendation = signal(false);

  readonly errorMessage = signal('');
  readonly contentError = signal('');

  readonly review = signal<ReviewProcessResponse | null>(null);
  readonly paper = signal<PaperResponse | null>(null);
  readonly comments = signal<ReviewCommentResponse[]>([]);
  readonly versionContent = signal('');
  readonly paperPdfUrl = signal<SafeResourceUrl | null>(null);
  private rawPaperPdfUrl: string | null = null;

  readonly reviewId = signal<number | null>(null);

  readonly isReviewCompleted = computed(() =>
    this.review()?.reviewerRecommendation !== null
  );

  readonly commentForm = this.formBuilder.nonNullable.group({
    comment: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(3000)
      ]
    ]
  });

  readonly recommendationForm = this.formBuilder.group({
    recommendation: [
      null as ReviewerRecommendation | null,
      Validators.required
    ]
  });

  readonly recommendationOptions: RecommendationOption[] = [
    {
      value: 'ACCEPT' as ReviewerRecommendation,
      label: 'Accept',
      description: 'The paper is suitable for acceptance.',
      icon: 'verified'
    },
    {
      value: 'MINOR_REVISION' as ReviewerRecommendation,
      label: 'Minor Revision',
      description: 'Small corrections are required.',
      icon: 'edit_note'
    },
    {
      value: 'MAJOR_REVISION' as ReviewerRecommendation,
      label: 'Major Revision',
      description: 'Significant changes are required.',
      icon: 'published_with_changes'
    },
    {
      value: 'REJECT' as ReviewerRecommendation,
      label: 'Reject',
      description: 'The paper should not be accepted.',
      icon: 'cancel'
    }
  ];

  ngOnInit(): void {
    const reviewId = Number(this.route.snapshot.paramMap.get('reviewId'));

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      this.errorMessage.set('Invalid review ID.');
      this.loading.set(false);
      return;
    }

    this.reviewId.set(reviewId);
    this.loadReview();
  }

  loadReview(): void {
    const user = this.tokenStorage.getUser();
    const reviewId = this.reviewId();

    if (!user || !reviewId) {
      this.errorMessage.set(
        'Unable to identify the logged-in reviewer or review.'
      );
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.reviewerService.getAssignedReviews(user.id).subscribe({
      next: (reviews) => {
        const selectedReview = reviews.find(
          (review) => review.reviewId === reviewId
        );

        if (!selectedReview) {
          this.errorMessage.set(
            'This review was not found or is not assigned to you.'
          );
          this.loading.set(false);
          return;
        }

        this.review.set(selectedReview);

        if (selectedReview.reviewerRecommendation) {
          this.recommendationForm.patchValue({
            recommendation: selectedReview.reviewerRecommendation
          });
        }

        this.loadPaper(selectedReview.paperId);
        this.loadComments(selectedReview.reviewId);
      },
      error: (error) => {
        console.error('Failed to load review:', error);
        this.errorMessage.set(
          'Unable to load this review. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  private loadPaper(paperId: number): void {
    this.paperService.getPaperById(paperId).subscribe({
      next: (paper) => {
        this.paper.set(paper);
        this.loading.set(false);

        if (this.review()?.currentVersion) {
          this.loadVersionContent();
        }
      },
      error: (error) => {
        console.error('Failed to load paper:', error);
        this.errorMessage.set(
          'The review was found, but the paper details could not be loaded.'
        );
        this.loading.set(false);
      }
    });
  }

  loadComments(reviewId?: number): void {
    const id = reviewId ?? this.reviewId();

    if (!id) {
      return;
    }

    this.reviewerService.getComments(id).subscribe({
      next: (comments) => {
        this.comments.set(comments);
      },
      error: (error) => {
        console.error('Failed to load comments:', error);
      }
    });
  }

  loadVersionContent(): void {
    const review = this.review();

    if (!review?.currentVersion) {
      this.contentError.set(
        'No file is connected to the current paper version.'
      );
      return;
    }

    this.loadingContent.set(true);
    this.contentError.set('');
    this.versionContent.set('');
    this.clearPdfUrl();

    this.paperService
      .downloadPaperPdfForReviewer(
        review.paperId,
        review.currentVersion,
        true
      )
      .subscribe({
        next: (pdfBlob) => {
          this.setPaperPdfBlob(pdfBlob);
        },
        error: (error) => {
          if (error?.status === 404) {
            this.loadCurrentPaperPdfFallback(review.paperId);
            return;
          }
          this.handlePaperContentLoadError(error);
        }
      });
  }

  ngOnDestroy(): void {
    this.clearPdfUrl();
  }

  submitComment(): void {
    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const user = this.tokenStorage.getUser();
    const review = this.review();

    if (!user || !review) {
      return;
    }

    if (!review.currentVersionId) {
      this.snackBar.open(
        'The current paper version does not have a version ID.',
        'Close',
        { duration: 4000 }
      );
      return;
    }

    this.submittingComment.set(true);

    this.reviewerService.addComment({
      reviewId: review.reviewId,
      versionId: review.currentVersionId,
      reviewerId: user.id,
      comment: this.commentForm.controls.comment.value.trim()
    }).subscribe({
      next: (createdComment) => {
        this.comments.update((comments) => [
          ...comments,
          createdComment
        ]);

        this.commentForm.reset();

        this.snackBar.open(
          'Comment added successfully.',
          'Close',
          { duration: 3000 }
        );

        this.submittingComment.set(false);
      },
      error: (error) => {
        console.error('Failed to add comment:', error);

        this.snackBar.open(
          'Unable to add the comment.',
          'Close',
          { duration: 4000 }
        );

        this.submittingComment.set(false);
      }
    });
  }

  submitRecommendation(): void {
    if (this.recommendationForm.invalid) {
      this.recommendationForm.markAllAsTouched();
      return;
    }

    const review = this.review();
    const recommendation =
      this.recommendationForm.controls.recommendation.value;

    if (!review || !recommendation) {
      return;
    }

    this.submittingRecommendation.set(true);

    this.reviewerService
      .submitRecommendation(review.reviewId, {
        recommendation
      })
      .subscribe({
        next: (updatedReview) => {
          this.review.set(updatedReview);

          this.snackBar.open(
            'Recommendation submitted successfully.',
            'Close',
            { duration: 3500 }
          );

          this.submittingRecommendation.set(false);
        },
        error: (error) => {
          console.error(
            'Failed to submit recommendation:',
            error
          );

          this.snackBar.open(
            'Unable to submit the recommendation.',
            'Close',
            { duration: 4000 }
          );

          this.submittingRecommendation.set(false);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/reviewer/assigned-papers']);
  }

  formatValue(value: string | null | undefined): string {
    if (!value) {
      return 'Not available';
    }

    return value
      .toLowerCase()
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ');
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  private clearPdfUrl(): void {
    if (this.rawPaperPdfUrl) {
      URL.revokeObjectURL(this.rawPaperPdfUrl);
      this.rawPaperPdfUrl = null;
    }
    this.paperPdfUrl.set(null);
  }

  private loadCurrentPaperPdfFallback(paperId: number): void {
    this.paperService.downloadCurrentPaperPdfForReviewer(paperId, true).subscribe({
      next: (pdfBlob) => {
        this.setPaperPdfBlob(pdfBlob);
      },
      error: (fallbackError) => {
        this.handlePaperContentLoadError(fallbackError);
      }
    });
  }

  private setPaperPdfBlob(pdfBlob: Blob): void {
    if (!pdfBlob || pdfBlob.size === 0) {
      this.contentError.set('Current version content is empty.');
      this.loadingContent.set(false);
      return;
    }

    const rawUrl = URL.createObjectURL(pdfBlob);
    this.rawPaperPdfUrl = rawUrl;
    this.paperPdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
    this.loadingContent.set(false);
  }

  private handlePaperContentLoadError(error: unknown): void {
    console.error('Failed to load paper content:', error);
    const status = (error as { status?: number } | null)?.status;
    this.contentError.set(status === 404
      ? 'Current version content is not available yet.'
      : 'Unable to load the current paper version.');
    this.loadingContent.set(false);
  }
}
