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
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { EditorService } from '@core/services/editor.service';
import { PaperService } from '@core/services/paper.service';
import { TokenStorageService } from '@core/services/token-storage.service';

import {
  PublicationResponse,
  ReviewProcessResponse
} from '@core/models';

import { LoadingSpinnerComponent } from
    '@shared/components/loading-spinner/loading-spinner.component';

type EditorPaperFilter =
  | 'ALL'
  | 'PENDING_ASSIGNMENT'
  | 'UNDER_REVIEW'
  | 'AWAITING_DECISION'
  | 'ACCEPTED'
  | 'PUBLISHED'
  | 'REJECTED';

@Component({
  selector: 'app-editor-papers',
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
  templateUrl: './editor-papers.component.html',
  styleUrl: './editor-papers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorPapersComponent implements OnInit {
  private readonly editorService = inject(EditorService);
  private readonly paperService = inject(PaperService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');

  readonly pendingReviews =
    signal<ReviewProcessResponse[]>([]);

  readonly assignedReviews =
    signal<ReviewProcessResponse[]>([]);

  readonly publications =
    signal<PublicationResponse[]>([]);

  readonly searchTerm = signal('');

  readonly selectedFilter =
    signal<EditorPaperFilter>('ALL');

  /**
   * A fast lookup containing every published PaperService paper ID.
   *
   * PublicationResponse.paperId must match
   * ReviewProcessResponse.paperId for this lookup to work.
   */
  readonly publishedPaperIds = computed(() => {
    return new Set(
      this.publications().map(
        (publication) => publication.paperId
      )
    );
  });

  /**
   * Pending and assigned endpoints may return the same review.
   * The Map removes duplicate reviews using reviewId.
   */
  readonly allReviews = computed(() => {
    const reviewsById =
      new Map<number, ReviewProcessResponse>();

    for (const review of this.pendingReviews()) {
      reviewsById.set(review.reviewId, review);
    }

    for (const review of this.assignedReviews()) {
      reviewsById.set(review.reviewId, review);
    }

    return Array.from(reviewsById.values());
  });

  readonly filteredReviews = computed(() => {
    const search =
      this.searchTerm().trim().toLowerCase();

    const filter = this.selectedFilter();

    return this.allReviews()
      .filter((review) => {
        if (filter === 'ALL') {
          return true;
        }

        return this.getWorkflowKey(review) === filter;
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
          review.currentVersion.toString().includes(search) ||
          this.getWorkflowLabel(review)
            .toLowerCase()
            .includes(search) ||
          this.formatValue(
            review.reviewerRecommendation
          )
            .toLowerCase()
            .includes(search) ||
          this.formatValue(review.editorDecision)
            .toLowerCase()
            .includes(search)
        );
      })
      .sort(
        (first, second) =>
          this.getWorkflowPriority(first) -
          this.getWorkflowPriority(second)
      );
  });

  readonly counts = computed(() => {
    const reviews = this.allReviews();

    return {
      all: reviews.length,

      pendingAssignment: reviews.filter(
        (review) =>
          this.getWorkflowKey(review) ===
          'PENDING_ASSIGNMENT'
      ).length,

      underReview: reviews.filter(
        (review) =>
          this.getWorkflowKey(review) ===
          'UNDER_REVIEW'
      ).length,

      awaitingDecision: reviews.filter(
        (review) =>
          this.getWorkflowKey(review) ===
          'AWAITING_DECISION'
      ).length,

      accepted: reviews.filter(
        (review) =>
          this.getWorkflowKey(review) === 'ACCEPTED'
      ).length,

      published: reviews.filter(
        (review) =>
          this.getWorkflowKey(review) === 'PUBLISHED'
      ).length,

      rejected: reviews.filter(
        (review) =>
          this.getWorkflowKey(review) === 'REJECTED'
      ).length
    };
  });

  ngOnInit(): void {
    this.loadPapers();
  }

  loadPapers(): void {
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
      pending:
        this.editorService.getPendingReviews(),

      assigned:
        this.editorService.getAssignedReviews(user.id),

      publications:
        this.paperService.getAllPublications()
    }).subscribe({
      next: ({
               pending,
               assigned,
               publications
             }) => {
        this.pendingReviews.set(pending ?? []);
        this.assignedReviews.set(assigned ?? []);
        this.publications.set(publications ?? []);

        this.loading.set(false);
      },

      error: (error) => {
        console.error(
          'Failed to load editor papers:',
          error
        );

        this.errorMessage.set(
          'Unable to load papers. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateFilter(value: EditorPaperFilter): void {
    this.selectedFilter.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedFilter.set('ALL');
  }

  isPublished(
    review: ReviewProcessResponse
  ): boolean {
    return this.publishedPaperIds().has(
      review.paperId
    );
  }

  getPaperTitle(
    review: ReviewProcessResponse
  ): string {
    return (
      review.paperTitle?.trim() ||
      `Paper #${review.paperId}`
    );
  }

  getWorkflowKey(
    review: ReviewProcessResponse
  ): EditorPaperFilter {
    /**
     * Publication must be checked before ACCEPTED.
     *
     * A published review still has editorDecision = ACCEPT,
     * so checking ACCEPT first would incorrectly show
     * "Publish Paper" again.
     */
    if (this.isPublished(review)) {
      return 'PUBLISHED';
    }

    const decision = this.normaliseValue(
      review.editorDecision
    );

    if (decision === 'ACCEPT') {
      return 'ACCEPTED';
    }

    if (decision === 'REJECT') {
      return 'REJECTED';
    }

    if (!review.reviewerId) {
      return 'PENDING_ASSIGNMENT';
    }

    if (review.reviewerRecommendation) {
      return 'AWAITING_DECISION';
    }

    return 'UNDER_REVIEW';
  }

  getWorkflowLabel(
    review: ReviewProcessResponse
  ): string {
    switch (this.getWorkflowKey(review)) {
      case 'PENDING_ASSIGNMENT':
        return 'Pending Assignment';

      case 'UNDER_REVIEW':
        return 'Under Review';

      case 'AWAITING_DECISION':
        return 'Awaiting Decision';

      case 'ACCEPTED':
        return 'Accepted';

      case 'PUBLISHED':
        return 'Published';

      case 'REJECTED':
        return 'Rejected';

      default:
        return 'Unknown';
    }
  }

  getWorkflowClass(
    review: ReviewProcessResponse
  ): string {
    switch (this.getWorkflowKey(review)) {
      case 'PENDING_ASSIGNMENT':
        return 'status--pending';

      case 'UNDER_REVIEW':
        return 'status--review';

      case 'AWAITING_DECISION':
        return 'status--decision';

      case 'ACCEPTED':
        return 'status--accepted';

      case 'PUBLISHED':
        return 'status--published';

      case 'REJECTED':
        return 'status--rejected';

      default:
        return '';
    }
  }

  getActionLabel(
    review: ReviewProcessResponse
  ): string {
    switch (this.getWorkflowKey(review)) {
      case 'PENDING_ASSIGNMENT':
        return 'Assign Reviewer';

      case 'AWAITING_DECISION':
        return 'Make Decision';

      case 'ACCEPTED':
        return 'Publish Paper';

      case 'PUBLISHED':
        return 'View Published';

      case 'REJECTED':
        return 'View Decision';

      case 'UNDER_REVIEW':
      default:
        return 'View Review';
    }
  }

  getActionIcon(
    review: ReviewProcessResponse
  ): string {
    switch (this.getWorkflowKey(review)) {
      case 'PENDING_ASSIGNMENT':
        return 'person_add';

      case 'AWAITING_DECISION':
        return 'gavel';

      case 'ACCEPTED':
        return 'publish';

      case 'PUBLISHED':
        return 'visibility';

      case 'REJECTED':
        return 'visibility';

      case 'UNDER_REVIEW':
      default:
        return 'rate_review';
    }
  }

  getActionRoute(
    review: ReviewProcessResponse
  ): (string | number)[] {
    switch (this.getWorkflowKey(review)) {
      case 'PENDING_ASSIGNMENT':
        return [
          '/editor/assign-reviewer',
          review.reviewId
        ];

      case 'ACCEPTED':
        return [
          '/editor/publish',
          review.reviewId
        ];

      case 'PUBLISHED':
        /**
         * This currently opens the Editor Published Papers list.
         *
         * Later, after creating a dedicated publication-details
         * component, this can route to:
         *
         * /editor/published-papers/{publicationId}
         */
        return [
          '/editor/published-papers'
        ];

      case 'AWAITING_DECISION':
      case 'REJECTED':
      case 'UNDER_REVIEW':
      default:
        return [
          '/editor/decisions',
          review.reviewId
        ];
    }
  }

  formatValue(value: unknown): string {
    if (
      value === null ||
      value === undefined
    ) {
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

  private normaliseValue(
    value: unknown
  ): string {
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

  private getWorkflowPriority(
    review: ReviewProcessResponse
  ): number {
    switch (this.getWorkflowKey(review)) {
      case 'PENDING_ASSIGNMENT':
        return 1;

      case 'AWAITING_DECISION':
        return 2;

      case 'UNDER_REVIEW':
        return 3;

      case 'ACCEPTED':
        return 4;

      case 'PUBLISHED':
        return 5;

      case 'REJECTED':
        return 6;

      default:
        return 7;
    }
  }
}
