import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ReportService } from '@core/services/report.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import {
  EditorReportSummaryResponse,
  ReviewerWorkloadResponse
} from '@core/models';

import { LoadingSpinnerComponent } from
  '@shared/components/loading-spinner/loading-spinner.component';

interface WorkflowCard {
  readonly label: string;
  readonly icon: string;
  readonly value: number;
  readonly modifier: string;
}

interface RecommendationRow {
  readonly label: string;
  readonly value: number;
  readonly percent: number;
  readonly modifier: string;
}

type WorkloadStatus = 'Completed' | 'Manageable' | 'Busy';

@Component({
  selector: 'app-editor-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './editor-reports.component.html',
  styleUrl: './editor-reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorReportsComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly summary = signal<EditorReportSummaryResponse | null>(null);

  readonly editorId = computed(() => {
    const user = this.tokenStorage.getUser();
    return user ? user.id : null;
  });

  readonly workflowCards = computed<WorkflowCard[]>(() => {
    const data = this.summary();
    if (!data) {
      return [];
    }

    return [
      {
        label: 'Total Papers',
        icon: 'folder',
        value: data.totalPapers,
        modifier: 'total'
      },
      {
        label: 'Pending Assignment',
        icon: 'pending_actions',
        value: data.pendingAssignment,
        modifier: 'pending'
      },
      {
        label: 'Under Review',
        icon: 'rate_review',
        value: data.underReview,
        modifier: 'review'
      },
      {
        label: 'Awaiting Decision',
        icon: 'gavel',
        value: data.awaitingDecision,
        modifier: 'awaiting'
      },
      {
        label: 'Accepted',
        icon: 'check_circle',
        value: data.accepted,
        modifier: 'accepted'
      },
      {
        label: 'Rejected',
        icon: 'cancel',
        value: data.rejected,
        modifier: 'rejected'
      },
      {
        label: 'Published',
        icon: 'workspace_premium',
        value: data.published,
        modifier: 'published'
      }
    ];
  });

  readonly recommendationRows = computed<RecommendationRow[]>(() => {
    const data = this.summary();
    if (!data) {
      return [];
    }

    const rec = data.recommendations;
    const total =
      rec.accept +
      rec.minorRevision +
      rec.majorRevision +
      rec.reject +
      rec.pending;

    const percent = (value: number): number => {
      if (total <= 0) {
        return 0;
      }
      return Math.round((value / total) * 100);
    };

    return [
      {
        label: 'Accept',
        value: rec.accept,
        percent: percent(rec.accept),
        modifier: 'accept'
      },
      {
        label: 'Minor Revision',
        value: rec.minorRevision,
        percent: percent(rec.minorRevision),
        modifier: 'minor'
      },
      {
        label: 'Major Revision',
        value: rec.majorRevision,
        percent: percent(rec.majorRevision),
        modifier: 'major'
      },
      {
        label: 'Reject',
        value: rec.reject,
        percent: percent(rec.reject),
        modifier: 'reject'
      },
      {
        label: 'Pending',
        value: rec.pending,
        percent: percent(rec.pending),
        modifier: 'pending'
      }
    ];
  });

  readonly reviewerWorkloads = computed<ReviewerWorkloadResponse[]>(
    () => this.summary()?.reviewerWorkloads ?? []
  );

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    const id = this.editorId();

    if (id === null || id === undefined || id <= 0) {
      this.summary.set(null);
      this.errorMessage.set(
        'Unable to identify the current editor. Please sign in again.'
      );
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.reportService.getEditorSummary(id).subscribe({
      next: (response) => {
        this.summary.set(response);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to load editor report summary:', error);
        this.summary.set(null);
        this.errorMessage.set(this.resolveErrorMessage(error));
        this.loading.set(false);
      }
    });
  }

  workloadStatus(pending: number): WorkloadStatus {
    if (pending === 0) {
      return 'Completed';
    }
    if (pending <= 2) {
      return 'Manageable';
    }
    return 'Busy';
  }

  workloadStatusModifier(pending: number): string {
    return this.workloadStatus(pending).toLowerCase();
  }

  reviewerLabel(reviewerId: number): string {
    return `Reviewer #${reviewerId}`;
  }

  private resolveErrorMessage(error: HttpErrorResponse): string {
    const body = error?.error as { message?: string } | string | null;

    if (body && typeof body === 'object' && typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }

    if (typeof body === 'string' && body.length > 0) {
      return body;
    }

    if (error?.message) {
      return error.message;
    }

    return 'Unable to load editor reports. Please try again.';
  }
}
