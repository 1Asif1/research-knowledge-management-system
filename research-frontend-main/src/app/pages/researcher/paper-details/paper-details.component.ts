import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

import { ResearcherService } from '@core/services/researcher.service';
import { ReviewerService } from '@core/services/reviewer.service';
import { PaperSubmissionResponse, ReviewCommentResponse, reviewStatusIntent, reviewStatusLabel } from '@core/models';

import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { TimelineComponent, TimelineStep } from '@shared/components/timeline/timeline.component';

@Component({
  selector: 'app-paper-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    LoadingSpinnerComponent,
    StatusBadgeComponent,
    TimelineComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './paper-details.component.html',
  styleUrl: './paper-details.component.scss'
})
export class PaperDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly researcherService = inject(ResearcherService);
  private readonly reviewerService = inject(ReviewerService);

  readonly loading = signal(true);
  readonly paper = signal<PaperSubmissionResponse | null>(null);
  readonly comments = signal<ReviewCommentResponse[]>([]);
  readonly commentsUnavailable = signal(false);
  readonly reviewStatusLabel = reviewStatusLabel;
  readonly reviewStatusIntent = reviewStatusIntent;

  readonly timelineSteps: TimelineStep[] = [];

  paperId!: number;

  ngOnInit(): void {
    this.paperId = Number(this.route.snapshot.paramMap.get('paperId'));

    this.researcherService.getSubmission(this.paperId).subscribe({
      next: (data) => {
        this.paper.set(data);
        this.loading.set(false);

        if (data.reviewId) {
          this.commentsUnavailable.set(false);
          this.reviewerService.getComments(data.reviewId).subscribe({
            next: (comments) => this.comments.set(comments),
            error: () => this.commentsUnavailable.set(true)
          });
          return;
        }

        this.commentsUnavailable.set(true);
      },
      error: () => this.loading.set(false)
    });
  }
}
