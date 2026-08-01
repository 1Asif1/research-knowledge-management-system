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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { EditorService } from '@core/services/editor.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { ReviewProcessResponse } from '@core/models';

import { LoadingSpinnerComponent } from
  '@shared/components/loading-spinner/loading-spinner.component';

type DecisionFilter =
  | 'AWAITING_DECISION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ALL';

@Component({
  selector: 'app-editorial-decisions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './editorial-decisions.component.html',
  styleUrl: './editorial-decisions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorialDecisionsComponent implements OnInit {
  private readonly editorService = inject(EditorService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly reviews = signal<ReviewProcessResponse[]>([]);

  readonly searchTerm = signal('');
  readonly selectedFilter =
    signal<DecisionFilter>('AWAITING_DECISION');

  readonly decisionReviews = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const filter = this.selectedFilter();

    return this.reviews()
      .filter((review) => {
        const state = this.getDecisionState(review);

        return filter === 'ALL' || state === filter;
      })
      .filter((review) => {
        if (!search) {
          return true;
        }

        const title = review.paperTitle ?? '';

        return (
          title.toLowerCase().includes(search) ||
          review.paperId.toString().includes(search) ||
          review.reviewId.toString().includes(search) ||
          this.formatValue(review.reviewerRecommendation)
            .toLowerCase()
            .includes(search)
        );
      });
  });

  readonly counts = computed(() => ({
    awaiting: this.reviews().filter(
      (review) =>
        this.getDecisionState(review) === 'AWAITING_DECISION'
    ).length,

    accepted: this.reviews().filter(
      (review) =>
        this.getDecisionState(review) === 'ACCEPTED'
    ).length,

    rejected: this.reviews().filter(
      (review) =>
        this.getDecisionState(review) === 'REJECTED'
    ).length
  }));

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
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

    this.editorService.getAssignedReviews(user.id).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(
          'Failed to load editorial decisions:',
          error
        );

        this.errorMessage.set(
          'Unable to load editorial decisions.'
        );

        this.loading.set(false);
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateFilter(value: DecisionFilter): void {
    this.selectedFilter.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedFilter.set('AWAITING_DECISION');
  }

  getDecisionState(
    review: ReviewProcessResponse
  ): DecisionFilter | 'NOT_READY' {
    const decision = this.normalise(review.editorDecision);

    if (decision === 'ACCEPT') {
      return 'ACCEPTED';
    }

    if (decision === 'REJECT') {
      return 'REJECTED';
    }

    if (review.reviewerRecommendation) {
      return 'AWAITING_DECISION';
    }

    return 'NOT_READY';
  }

  getPaperTitle(review: ReviewProcessResponse): string {
    return (
      review.paperTitle?.trim() ||
      `Paper #${review.paperId}`
    );
  }

  getDecisionLabel(
    review: ReviewProcessResponse
  ): string {
    switch (this.getDecisionState(review)) {
      case 'AWAITING_DECISION':
        return 'Awaiting Decision';
      case 'ACCEPTED':
        return 'Accepted';
      case 'REJECTED':
        return 'Rejected';
      default:
        return 'Not Ready';
    }
  }

  getDecisionClass(
    review: ReviewProcessResponse
  ): string {
    switch (this.getDecisionState(review)) {
      case 'AWAITING_DECISION':
        return 'decision--pending';
      case 'ACCEPTED':
        return 'decision--accepted';
      case 'REJECTED':
        return 'decision--rejected';
      default:
        return '';
    }
  }

  getActionLabel(
    review: ReviewProcessResponse
  ): string {
    switch (this.getDecisionState(review)) {
      case 'AWAITING_DECISION':
        return 'Make Decision';

      case 'ACCEPTED':
        return 'Publish Paper';

      case 'REJECTED':
        return 'View Decision';

      default:
        return 'View';
    }
  }

  getActionIcon(
    review: ReviewProcessResponse
  ): string {
    switch (this.getDecisionState(review)) {
      case 'AWAITING_DECISION':
        return 'gavel';

      case 'ACCEPTED':
        return 'publish';

      case 'REJECTED':
        return 'visibility';

      default:
        return 'visibility';
    }
  }

  getActionRoute(
    review: ReviewProcessResponse
  ): (string | number)[] {
    if (
      this.getDecisionState(review) === 'ACCEPTED'
    ) {
      return [
        '/editor/publish',
        review.reviewId
      ];
    }

    return [
      '/editor/decisions',
      review.reviewId
    ];
  }

  formatValue(value: unknown): string {
    if (value === null || value === undefined) {
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

  private normalise(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim().toUpperCase();
  }
}
