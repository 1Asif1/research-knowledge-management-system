import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { EditorService } from '@core/services/editor.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { ReviewProcessResponse } from '@core/models';

import { LoadingSpinnerComponent } from
  '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-editor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './editor-dashboard.component.html',
  styleUrl: './editor-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorDashboardComponent implements OnInit {
  private readonly editorService = inject(EditorService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly pendingReviews = signal<ReviewProcessResponse[]>([]);
  readonly assignedReviews = signal<ReviewProcessResponse[]>([]);

  /**
   * Combines pending and assigned reviews while preventing duplicate
   * review IDs from being displayed.
   */
  readonly allReviews = computed(() => {
    const reviewMap = new Map<number, ReviewProcessResponse>();

    for (const review of this.pendingReviews()) {
      reviewMap.set(review.reviewId, review);
    }

    for (const review of this.assignedReviews()) {
      reviewMap.set(review.reviewId, review);
    }

    return Array.from(reviewMap.values());
  });

  readonly stats = computed(() => {
    const reviews = this.allReviews();

    return {
      total: reviews.length,

      pendingAssignment: reviews.filter(
        (review) => !review.reviewerId
      ).length,

      underReview: reviews.filter(
        (review) =>
          review.reviewerId !== null &&
          review.reviewerRecommendation === null &&
          !this.hasFinalDecision(review)
      ).length,

      awaitingDecision: reviews.filter(
        (review) =>
          review.reviewerRecommendation !== null &&
          !this.hasFinalDecision(review)
      ).length,

      accepted: reviews.filter(
        (review) =>
          this.normaliseValue(review.editorDecision) === 'ACCEPT'
      ).length,

      rejected: reviews.filter(
        (review) =>
          this.normaliseValue(review.editorDecision) === 'REJECT'
      ).length
    };
  });

  /**
   * Puts papers requiring immediate editor action first.
   */
  readonly attentionReviews = computed(() => {
    return [...this.allReviews()]
      .sort((first, second) => {
        return (
          this.getPriority(first) -
          this.getPriority(second)
        );
      })
      .slice(0, 6);
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    const user = this.tokenStorage.getUser();

    if (!user) {
      this.errorMessage.set(
        'Unable to identify the logged-in editor.'
      );
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      pending: this.editorService.getPendingReviews(),
      assigned: this.editorService.getAssignedReviews(user.id)
    }).subscribe({
      next: ({ pending, assigned }) => {
        this.pendingReviews.set(pending);
        this.assignedReviews.set(assigned);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(
          'Failed to load editor dashboard:',
          error
        );

        this.errorMessage.set(
          'Unable to load editor dashboard data. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  getPaperTitle(review: ReviewProcessResponse): string {
    const title = review.paperTitle?.trim();

    return title || `Paper #${review.paperId}`;
  }

  getActionLabel(review: ReviewProcessResponse): string {
    if (!review.reviewerId) {
      return 'Assign Reviewer';
    }

    if (
      review.reviewerRecommendation &&
      !this.hasFinalDecision(review)
    ) {
      return 'Make Decision';
    }

    if (this.hasFinalDecision(review)) {
      return 'View Decision';
    }

    return 'View Review';
  }

  getActionIcon(review: ReviewProcessResponse): string {
    if (!review.reviewerId) {
      return 'person_add';
    }

    if (
      review.reviewerRecommendation &&
      !this.hasFinalDecision(review)
    ) {
      return 'gavel';
    }

    if (this.hasFinalDecision(review)) {
      return 'visibility';
    }

    return 'rate_review';
  }

  getActionRoute(
    review: ReviewProcessResponse
  ): (string | number)[] {
    if (!review.reviewerId) {
      return [
        '/editor/assign-reviewer',
        review.reviewId
      ];
    }

    if (
      review.reviewerRecommendation &&
      !this.hasFinalDecision(review)
    ) {
      return [
        '/editor/decisions',
        review.reviewId
      ];
    }

    if (this.hasFinalDecision(review)) {
      return [
        '/editor/decisions',
        review.reviewId
      ];
    }

    return ['/editor/papers'];
  }

  getWorkflowLabel(
    review: ReviewProcessResponse
  ): string {
    if (!review.reviewerId) {
      return 'Pending Assignment';
    }

    if (
      review.reviewerRecommendation &&
      !this.hasFinalDecision(review)
    ) {
      return 'Awaiting Decision';
    }

    if (
      this.normaliseValue(review.editorDecision) ===
      'ACCEPT'
    ) {
      return 'Accepted';
    }

    if (
      this.normaliseValue(review.editorDecision) ===
      'REJECT'
    ) {
      return 'Rejected';
    }

    return this.formatValue(review.reviewStatus);
  }

  getWorkflowClass(
    review: ReviewProcessResponse
  ): string {
    if (!review.reviewerId) {
      return 'status--pending';
    }

    if (
      review.reviewerRecommendation &&
      !this.hasFinalDecision(review)
    ) {
      return 'status--decision';
    }

    if (
      this.normaliseValue(review.editorDecision) ===
      'ACCEPT'
    ) {
      return 'status--accepted';
    }

    if (
      this.normaliseValue(review.editorDecision) ===
      'REJECT'
    ) {
      return 'status--rejected';
    }

    return 'status--review';
  }

  formatValue(
    value: unknown
  ): string {
    if (value === null || value === undefined) {
      return 'Not available';
    }

    return String(value)
      .toLowerCase()
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ');
  }

  private hasFinalDecision(
    review: ReviewProcessResponse
  ): boolean {
    const decision = this.normaliseValue(
      review.editorDecision
    );

    return (
      decision !== '' &&
      decision !== 'PENDING'
    );
  }

  private normaliseValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim().toUpperCase();
  }

  private getPriority(
    review: ReviewProcessResponse
  ): number {
    if (!review.reviewerId) {
      return 1;
    }

    if (
      review.reviewerRecommendation &&
      !this.hasFinalDecision(review)
    ) {
      return 2;
    }

    if (!this.hasFinalDecision(review)) {
      return 3;
    }

    return 4;
  }
}
