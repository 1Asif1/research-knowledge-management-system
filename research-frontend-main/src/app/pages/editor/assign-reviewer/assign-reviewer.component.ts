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
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

import { EditorService } from '@core/services/editor.service';
import { TokenStorageService } from '@core/services/token-storage.service';

import {
  AvailableReviewerResponse,
  ReviewProcessResponse
} from '@core/models';

import { SnackbarService } from
  '@shared/services/snackbar.service';

import { LoadingSpinnerComponent } from
  '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-assign-reviewer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './assign-reviewer.component.html',
  styleUrl: './assign-reviewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignReviewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  private readonly editorService = inject(EditorService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly snackbar = inject(SnackbarService);

  readonly loading = signal(true);
  readonly assigning = signal(false);
  readonly errorMessage = signal('');

  readonly selectedReview = signal<ReviewProcessResponse | null>(
    null
  );

  readonly reviewers = signal<AvailableReviewerResponse[]>([]);
  readonly searchTerm = signal('');
  readonly selectedReviewerId = signal<number | null>(null);
  readonly reviewId = signal<number | null>(null);

  readonly assignmentForm = this.formBuilder.nonNullable.group({
    reviewerId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });

  readonly filteredReviewers = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) {
      return this.reviewers();
    }

    return this.reviewers().filter((reviewer) => {
      const fullName =
        `${reviewer.firstName} ${reviewer.lastName}`
          .trim()
          .toLowerCase();

      return (
        fullName.includes(search) ||
        reviewer.id.toString().includes(search)
      );
    });
  });

  readonly selectedReviewer = computed(() => {
    const reviewerId = this.selectedReviewerId();

    if (reviewerId === null) {
      return null;
    }

    return (
      this.reviewers().find(
        (reviewer) => reviewer.id === reviewerId
      ) ?? null
    );
  });

  ngOnInit(): void {
    const routeReviewId =
      this.route.snapshot.paramMap.get('reviewId');

    if (!routeReviewId) {
      this.errorMessage.set(
        'No review was selected. Open a pending paper from the Papers page.'
      );
      this.loading.set(false);
      return;
    }

    const reviewId = Number(routeReviewId);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      this.errorMessage.set('Invalid review ID.');
      this.loading.set(false);
      return;
    }

    this.reviewId.set(reviewId);
    this.loadAssignmentData(reviewId);
  }

  loadAssignmentData(reviewId: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      review: this.editorService.getReview(reviewId),
      reviewers: this.editorService.getAvailableReviewers()
    }).subscribe({
      next: ({ review, reviewers }) => {
        if (review.reviewerId) {
          this.errorMessage.set(
            'A reviewer has already been assigned to this paper.'
          );

          this.selectedReview.set(review);
          this.reviewers.set(reviewers);
          this.loading.set(false);
          return;
        }

        this.selectedReview.set(review);
        this.reviewers.set(reviewers);
        this.loading.set(false);
      },
      error: (error) => {
        console.error(
          'Failed to load reviewer assignment data:',
          error
        );

        this.errorMessage.set(
          'Unable to load the paper or available reviewers.'
        );

        this.loading.set(false);
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  selectReviewer(reviewerId: number): void {
    this.selectedReviewerId.set(reviewerId);

    this.assignmentForm.controls.reviewerId.setValue(
      reviewerId
    );

    this.assignmentForm.controls.reviewerId.markAsTouched();
  }

  assignReviewer(): void {
    const user = this.tokenStorage.getUser();
    const review = this.selectedReview();

    if (!user) {
      this.snackbar.error(
        'Your session has expired. Please sign in again.'
      );

      this.router.navigate(['/auth/login']);
      return;
    }

    if (!review) {
      this.snackbar.error('No review was selected.');
      return;
    }

    if (this.assignmentForm.invalid) {
      this.assignmentForm.markAllAsTouched();
      return;
    }

    const reviewerId =
      this.assignmentForm.controls.reviewerId.value;

    this.assigning.set(true);

    this.editorService.assignReviewer({
      reviewId: review.reviewId,
      reviewerId,
      editorId: user.id
    }).subscribe({
      next: () => {
        this.assigning.set(false);

        this.snackbar.success(
          'Reviewer assigned successfully.'
        );

        this.router.navigate(['/editor/papers']);
      },
      error: (error) => {
        console.error('Failed to assign reviewer:', error);

        this.assigning.set(false);

        this.snackbar.error(
          error.error?.message ??
          error.error?.detail ??
          'Unable to assign the reviewer.'
        );
      }
    });
  }

  getPaperTitle(): string {
    const review = this.selectedReview();

    return (
      review?.paperTitle?.trim() ||
      `Paper #${review?.paperId ?? ''}`
    );
  }

  getReviewerName(
    reviewer: AvailableReviewerResponse
  ): string {
    const fullName =
      `${reviewer.firstName ?? ''} ${reviewer.lastName ?? ''}`
        .trim();

    return fullName || `Reviewer #${reviewer.id}`;
  }

  getInitials(
    reviewer: AvailableReviewerResponse
  ): string {
    const first =
      reviewer.firstName?.trim().charAt(0) ?? '';

    const last =
      reviewer.lastName?.trim().charAt(0) ?? '';

    const initials = `${first}${last}`.toUpperCase();

    return initials || 'R';
  }

  goBack(): void {
    this.router.navigate(['/editor/papers']);
  }
}
