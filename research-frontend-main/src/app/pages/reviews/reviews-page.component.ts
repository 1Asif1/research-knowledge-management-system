import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ModuleHeaderComponent } from '@shared/components/module-header/module-header.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { EditorService } from '@core/services/editor.service';
import { ReviewerService } from '@core/services/reviewer.service';
import { NotificationService } from '@core/services/notification.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import {
  AvailableReviewerResponse,
  AssignReviewerRequest,
  NotificationType,
  ReviewProcessResponse,
  reviewStatusIntent,
  reviewStatusLabel,
  recommendationLabel,
  editorDecisionLabel,
  Role
} from '@core/models';
import { roleFromUrl } from '@pages/page-role.utils';
import { SnackbarService } from '@shared/services/snackbar.service';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ModuleHeaderComponent, LoadingSpinnerComponent, StatusBadgeComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-module-header [module]="moduleLabel()" title="Reviews"></app-module-header>

    <app-loading-spinner *ngIf="loading()" message="Loading reviews..."></app-loading-spinner>

    <div class="reviews-error" *ngIf="error()">{{ error() }}</div>

    <section class="review-list" *ngIf="!loading() && !error()">
      <article class="review-row" *ngFor="let review of reviews()">
        <div>
          <h3>{{ review.paperTitle || ('Paper #' + review.paperId) }}</h3>
          <p>Version {{ review.currentVersion }}</p>
          <p class="review-row__meta">
            Recommendation: {{ recommendationLabel(review.reviewerRecommendation) }} ·
            Decision: {{ editorDecisionLabel(review.editorDecision) }}
          </p>
        </div>

        <div class="review-row__right">
          <app-status-badge [label]="reviewStatusLabel(review.reviewStatus)" [intent]="reviewStatusIntent(review.reviewStatus)"></app-status-badge>

          <div class="review-row__assign" *ngIf="isEditorRole()">
            <ng-container *ngIf="!review.reviewerId; else assignedTemplate">
              <select
                class="review-row__select"
                [ngModel]="selectedReviewerByReviewId()[review.reviewId] ?? null"
                (ngModelChange)="setSelectedReviewer(review.reviewId, $event)"
              >
                <option [ngValue]="null" disabled>Select reviewer</option>
                <option *ngFor="let reviewer of reviewers()" [ngValue]="reviewer.id">
                  {{ reviewer.firstName }} {{ reviewer.lastName }}
                </option>
              </select>
              <button
                type="button"
                class="review-row__assign-btn"
                [disabled]="!selectedReviewerByReviewId()[review.reviewId] || assigningByReviewId()[review.reviewId] || reviewers().length === 0"
                (click)="assignReviewer(review)"
              >
                {{ assigningByReviewId()[review.reviewId] ? 'Assigning...' : 'Assign Reviewer' }}
              </button>
            </ng-container>

            <ng-template #assignedTemplate>
              <p class="review-row__assigned">Reviewer assigned (ID {{ review.reviewerId }})</p>
            </ng-template>
          </div>
        </div>
      </article>
      <article class="review-row" *ngIf="reviews().length === 0">
        <p>No reviews available.</p>
      </article>
    </section>
  `,
  styles: [`
    .review-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .review-row {
      border: 1px solid #dbe2ed;
      border-radius: 12px;
      background: #fff;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
    }

    .review-row h3 {
      margin: 0 0 6px;
      color: #10284a;
      font-size: 18px;
    }

    .review-row p {
      margin: 0;
      color: #455677;
      font-size: 14px;
    }

    .review-row__meta {
      margin-top: 6px !important;
      font-size: 13px !important;
    }

    .review-row__right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .review-row__assign {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .review-row__select {
      min-width: 190px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--surface-border);
      background: #fff;
      color: var(--text-primary);
      padding: 0 10px;
      font-size: 13px;
    }

    .review-row__assign-btn {
      height: 36px;
      border: 0;
      border-radius: 8px;
      padding: 0 12px;
      background: var(--color-primary-600);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .review-row__assign-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .review-row__assigned {
      font-size: 13px !important;
      color: var(--text-secondary) !important;
      margin: 0 !important;
      white-space: nowrap;
    }

    .reviews-error {
      border: 1px solid #dbe2ed;
      border-radius: 12px;
      background: #fff;
      padding: 16px 18px;
      color: #455677;
      font-size: 14px;
    }
  `]
})
export class ReviewsPageComponent {
  private readonly reviewerService = inject(ReviewerService);
  private readonly editorService = inject(EditorService);
  private readonly notificationService = inject(NotificationService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly snackbar = inject(SnackbarService);

  readonly reviews = signal<ReviewProcessResponse[]>([]);
  readonly reviewers = signal<AvailableReviewerResponse[]>([]);
  readonly selectedReviewerByReviewId = signal<Record<number, number | null>>({});
  readonly assigningByReviewId = signal<Record<number, boolean>>({});
  readonly isEditorRole = signal(false);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly moduleLabel = () => `MODULE 3 · ${roleFromUrl(window.location.pathname)}`;
  readonly reviewStatusLabel = reviewStatusLabel;
  readonly reviewStatusIntent = reviewStatusIntent;
  readonly recommendationLabel = recommendationLabel;
  readonly editorDecisionLabel = editorDecisionLabel;

  constructor() {
    const user = this.tokenStorage.getUser();
    const role = roleFromUrl(window.location.pathname);

    if (!user) {
      this.error.set('Please sign in to view reviews.');
      this.loading.set(false);
      return;
    }

    if (role === Role.EDITOR) {
      this.isEditorRole.set(true);
      this.loadAvailableReviewers();
      this.editorService.getPendingReviews().subscribe({
        next: (reviews) => {
          this.reviews.set(reviews);
          this.seedReviewerSelection(reviews);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(error.status === 0 ? 'Review service is not reachable.' : 'Unable to load reviews.');
        }
      });
      return;
    }

    this.reviewerService.getAssignedReviews(user.id).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(error.status === 0 ? 'Review service is not reachable.' : 'Unable to load reviews.');
      }
    });
  }

  setSelectedReviewer(reviewId: number, reviewerId: number | null): void {
    this.selectedReviewerByReviewId.update((current) => ({
      ...current,
      [reviewId]: reviewerId
    }));
  }

  assignReviewer(review: ReviewProcessResponse): void {
    const editor = this.tokenStorage.getUser();
    const reviewerId = this.selectedReviewerByReviewId()[review.reviewId];

    if (!editor || !reviewerId) {
      this.snackbar.error('Select a reviewer before assigning.');
      return;
    }

    const request: AssignReviewerRequest = {
      reviewId: review.reviewId,
      reviewerId,
      editorId: editor.id
    };

    this.setAssigning(review.reviewId, true);
    this.editorService.assignReviewer(request).subscribe({
      next: (updatedReview) => {
        this.reviews.update((existing) =>
          existing.map((item) => (item.reviewId === updatedReview.reviewId ? updatedReview : item))
        );
        this.createReviewerAssignmentNotification(
          reviewerId,
          updatedReview.paperId,
          review.reviewId,
          updatedReview.paperTitle ?? review.paperTitle ?? null
        );
      },
      error: (error: HttpErrorResponse) => {
        this.setAssigning(review.reviewId, false);
        this.snackbar.error(error.error?.message ?? 'Unable to assign reviewer.');
      }
    });
  }

  private loadAvailableReviewers(): void {
    this.editorService.getAvailableReviewers().subscribe({
      next: (reviewers) => {
        this.reviewers.set(reviewers);
      },
      error: (error: HttpErrorResponse) => {
        this.reviewers.set([]);
        this.snackbar.error(error.error?.message ?? 'Unable to load available reviewers.');
      }
    });
  }

  private seedReviewerSelection(reviews: ReviewProcessResponse[]): void {
    const selected = this.selectedReviewerByReviewId();
    const nextSelection: Record<number, number | null> = {};
    for (const review of reviews) {
      nextSelection[review.reviewId] = selected[review.reviewId] ?? null;
    }
    this.selectedReviewerByReviewId.set(nextSelection);
  }

  private createReviewerAssignmentNotification(
    reviewerId: number,
    paperId: number,
    reviewId: number,
    paperTitle: string | null
  ): void {
    const paperLabel = paperTitle ? `"${paperTitle}"` : `Paper #${paperId}`;
    this.notificationService.createNotification({
      userId: reviewerId,
      title: 'New review assignment',
      message: `You have been assigned ${paperLabel} for review #${reviewId}.`,
      type: NotificationType.REVIEW_ASSIGNED
    }).subscribe({
      next: () => {
        this.setAssigning(reviewId, false);
        this.snackbar.success('Reviewer assigned and notified.');
      },
      error: (error: HttpErrorResponse) => {
        this.setAssigning(reviewId, false);
        this.snackbar.error(error.error?.message ?? 'Reviewer assigned, but notification could not be sent.');
      }
    });
  }

  private setAssigning(reviewId: number, value: boolean): void {
    this.assigningByReviewId.update((current) => ({
      ...current,
      [reviewId]: value
    }));
  }
}
