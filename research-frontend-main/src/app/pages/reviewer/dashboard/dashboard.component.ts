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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ReviewerService } from '@core/services/reviewer.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { ReviewProcessResponse } from '@core/models';

import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { PaperCardComponent } from '@shared/components/paper-card/paper-card.component';
import {
  TimelineComponent,
  TimelineStep
} from '@shared/components/timeline/timeline.component';

@Component({
  selector: 'app-reviewer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent,
    PaperCardComponent,
    TimelineComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewerDashboardComponent implements OnInit {
  private readonly reviewerService = inject(ReviewerService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly reviews = signal<ReviewProcessResponse[]>([]);

  readonly stats = computed(() => {
    const allReviews = this.reviews();

    const completedReviews = allReviews.filter(
      (review) => review.reviewerRecommendation !== null
    );

    const pendingReviews = allReviews.filter(
      (review) => review.reviewerRecommendation === null
    );

    const revisionRecommendations = allReviews.filter(
      (review) =>
        review.reviewerRecommendation === 'MINOR_REVISION' ||
        review.reviewerRecommendation === 'MAJOR_REVISION'
    );

    const acceptedReviews = allReviews.filter(
      (review) => review.reviewerRecommendation === 'ACCEPT'
    );

    return {
      total: allReviews.length,
      pending: pendingReviews.length,
      completed: completedReviews.length,
      revisions: revisionRecommendations.length,
      accepted: acceptedReviews.length
    };
  });

  readonly recentAssignments = computed(() =>
    this.reviews()
      .filter((review) => review.reviewerRecommendation === null)
      .slice(0, 6)
  );

  readonly timelineSteps = computed<TimelineStep[]>(() =>
    this.reviews()
      .slice(0, 5)
      .map((review) => {
        const completed = review.reviewerRecommendation !== null;

        return {
          label: `Paper #${review.paperId}`,
          description: completed
            ? `Recommendation submitted: ${this.formatRecommendation(
                review.reviewerRecommendation
              )}`
            : `Version ${review.currentVersion} assigned for review`,
          timestamp: '',
          state: completed ? ('completed' as const) : ('current' as const),
          icon: completed ? 'task_alt' : 'rate_review'
        };
      })
  );

  ngOnInit(): void {
    const user = this.tokenStorage.getUser();

    if (!user) {
      this.errorMessage.set('Unable to identify the logged-in reviewer.');
      this.loading.set(false);
      return;
    }

    this.reviewerService.getAssignedReviews(user.id).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load reviewer dashboard:', error);
        this.errorMessage.set(
          'Unable to load your assigned reviews. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  formatRecommendation(
    recommendation: string | null | undefined
  ): string {
    if (!recommendation) {
      return 'Pending';
    }

    return recommendation
      .toLowerCase()
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ');
  }
}
