import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ResearcherService } from '@core/services/researcher.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { PaperSubmissionResponse } from '@core/models';

import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { TimelineComponent, TimelineStep } from '@shared/components/timeline/timeline.component';
import { PaperCardComponent } from '@shared/components/paper-card/paper-card.component';

@Component({
  selector: 'app-researcher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    LoadingSpinnerComponent,
    TimelineComponent,
    PaperCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly researcherService = inject(ResearcherService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly loading = signal(true);
  readonly submissions = signal<PaperSubmissionResponse[]>([]);

  readonly stats = computed(() => {
    const all = this.submissions();
    return {
      total: all.length,
      // NOTE: PaperSubmissionResponse (ResearcherController) doesn't currently
      // return a status field — only paperId/title/researcherId/submittedDate.
      // Counts below default to "total" until ResearcherController exposes
      // status per submission; wire these up for real once it does.
      underReview: 0,
      correctionsRequested: 0,
      accepted: 0,
      rejected: 0
    };
  });

  readonly recentSubmissions = computed(() => this.submissions().slice(0, 6));

  readonly timelineSteps = computed<TimelineStep[]>(() => {
    return this.submissions()
      .slice(0, 5)
      .map((s) => ({
        label: s.title,
        description: `Submitted for review`,
        timestamp: s.submittedDate,
        state: 'completed' as const,
        icon: 'upload_file'
      }));
  });

  ngOnInit(): void {
    const user = this.tokenStorage.getUser();
    if (!user) {
      this.loading.set(false);
      return;
    }

    this.researcherService.getMySubmissions(user.id).subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
