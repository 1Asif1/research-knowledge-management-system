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
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { ReviewerService } from '@core/services/reviewer.service';
import { TokenStorageService } from '@core/services/token-storage.service';

import {
  ReviewProcessResponse,
  ReviewerRecommendation
} from '@core/models';

import { LoadingSpinnerComponent } from
  '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reviewed-papers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './reviewed-papers.component.html',
  styleUrl: './reviewed-papers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewedPapersComponent implements OnInit {
  private readonly reviewerService = inject(ReviewerService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly reviews = signal<ReviewProcessResponse[]>([]);
  readonly searchTerm = signal('');
  readonly recommendationFilter = signal('ALL');

  readonly reviewedPapers = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const recommendation = this.recommendationFilter();

    return this.reviews()
      .filter((review) => review.reviewerRecommendation !== null)
      .filter((review) => {
        if (
          recommendation !== 'ALL' &&
          review.reviewerRecommendation !== recommendation
        ) {
          return false;
        }

        if (!search) {
          return true;
        }

        return (
          review.paperId.toString().includes(search) ||
          review.reviewId.toString().includes(search) ||
          review.reviewStatus.toLowerCase().includes(search) ||
          review.reviewerRecommendation
            ?.toLowerCase()
            .includes(search)
        );
      });
  });

  readonly totalReviewed = computed(
    () =>
      this.reviews().filter(
        (review) => review.reviewerRecommendation !== null
      ).length
  );

  readonly acceptedCount = computed(
    () =>
      this.reviews().filter(
        (review) => review.reviewerRecommendation === 'ACCEPT'
      ).length
  );

  readonly revisionCount = computed(
    () =>
      this.reviews().filter(
        (review) =>
          review.reviewerRecommendation === 'MINOR_REVISION' ||
          review.reviewerRecommendation === 'MAJOR_REVISION'
      ).length
  );

  readonly rejectedCount = computed(
    () =>
      this.reviews().filter(
        (review) => review.reviewerRecommendation === 'REJECT'
      ).length
  );

  ngOnInit(): void {
    this.loadReviewedPapers();
  }

  loadReviewedPapers(): void {
    const user = this.tokenStorage.getUser();

    if (!user) {
      this.errorMessage.set(
        'Unable to identify the logged-in reviewer.'
      );
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.reviewerService.getAssignedReviews(user.id).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load reviewed papers:', error);

        this.errorMessage.set(
          'Unable to load reviewed papers. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateRecommendationFilter(value: string): void {
    this.recommendationFilter.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.recommendationFilter.set('ALL');
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

  getRecommendationIcon(
    recommendation: ReviewerRecommendation | null
  ): string {
    switch (recommendation) {
      case 'ACCEPT':
        return 'verified';

      case 'MINOR_REVISION':
        return 'edit_note';

      case 'MAJOR_REVISION':
        return 'published_with_changes';

      case 'REJECT':
        return 'cancel';

      default:
        return 'help_outline';
    }
  }

  getRecommendationClass(
    recommendation: ReviewerRecommendation | null
  ): string {
    switch (recommendation) {
      case 'ACCEPT':
        return 'recommendation--accept';

      case 'MINOR_REVISION':
        return 'recommendation--minor';

      case 'MAJOR_REVISION':
        return 'recommendation--major';

      case 'REJECT':
        return 'recommendation--reject';

      default:
        return '';
    }
  }
}
