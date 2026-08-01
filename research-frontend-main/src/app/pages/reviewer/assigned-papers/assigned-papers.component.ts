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

import { ReviewerService } from '@core/services/reviewer.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { ReviewProcessResponse } from '@core/models';

import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-assigned-papers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './assigned-papers.component.html',
  styleUrl: './assigned-papers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignedPapersComponent implements OnInit {
  private readonly reviewerService = inject(ReviewerService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly reviews = signal<ReviewProcessResponse[]>([]);
  readonly searchTerm = signal('');

  readonly pendingReviews = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    return this.reviews()
      .filter((review) => !review.reviewerRecommendation)
      .filter((review) => {
        if (!search) {
          return true;
        }

        return (
          (review.paperTitle ?? '').toLowerCase().includes(search) ||
          review.paperId.toString().includes(search) ||
          review.reviewId.toString().includes(search) ||
          review.currentVersion.toString().includes(search) ||
          review.reviewStatus.toLowerCase().includes(search)
        );
      });
  });

  ngOnInit(): void {
    this.loadAssignedReviews();
  }

  loadAssignedReviews(): void {
    const user = this.tokenStorage.getUser();

    if (!user) {
      this.errorMessage.set('Unable to identify the logged-in reviewer.');
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
        console.error('Failed to load assigned reviews:', error);
        this.errorMessage.set(
          'Unable to load assigned papers. Please try again.'
        );
        this.loading.set(false);
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  formatStatus(status: string): string {
    return status
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
