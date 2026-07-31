import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { ModuleHeaderComponent } from '@shared/components/module-header/module-header.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { EditorService } from '@core/services/editor.service';
import { ReviewerService } from '@core/services/reviewer.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import {
  ReviewProcessResponse,
  reviewStatusIntent,
  reviewStatusLabel,
  recommendationLabel,
  editorDecisionLabel,
  Role
} from '@core/models';
import { roleFromUrl } from '@pages/page-role.utils';

@Component({
  selector: 'app-reviews-page',
  standalone: true,
  imports: [CommonModule, ModuleHeaderComponent, LoadingSpinnerComponent, StatusBadgeComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-module-header [module]="moduleLabel()" title="Reviews"></app-module-header>

    <app-loading-spinner *ngIf="loading()" message="Loading reviews..."></app-loading-spinner>

    <div class="reviews-error" *ngIf="error()">{{ error() }}</div>

    <section class="review-list" *ngIf="!loading() && !error()">
      <article class="review-row" *ngFor="let review of reviews()">
        <div>
          <h3>Paper #{{ review.paperId }}</h3>
          <p>Version {{ review.currentVersion }}</p>
          <p class="review-row__meta">
            Recommendation: {{ recommendationLabel(review.reviewerRecommendation) }} ·
            Decision: {{ editorDecisionLabel(review.editorDecision) }}
          </p>
        </div>
        <app-status-badge [label]="reviewStatusLabel(review.reviewStatus)" [intent]="reviewStatusIntent(review.reviewStatus)"></app-status-badge>
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
  private readonly tokenStorage = inject(TokenStorageService);

  readonly reviews = signal<ReviewProcessResponse[]>([]);
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

    const request$ = role === Role.REVIEWER
      ? this.reviewerService.getAssignedReviews(user.id)
      : role === Role.EDITOR
        ? this.editorService.getAssignedReviews(user.id)
        : this.editorService.getPendingReviews();

    request$.subscribe({
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
}
