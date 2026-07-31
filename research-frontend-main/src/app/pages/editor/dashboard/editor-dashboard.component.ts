import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface EditorQueueItem {
  reviewId: number;
  paperId: number;
  title: string;
  researcherName: string;
  status:
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'REVISION_REQUESTED'
    | 'REVIEW_COMPLETED';
  submittedDate: string;
  assignedReviewers: number;
}

@Component({
  selector: 'app-editor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './editor-dashboard.component.html',
  styleUrl: './editor-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorDashboardComponent {
  readonly queueItems = signal<EditorQueueItem[]>([
    {
      reviewId: 101,
      paperId: 21,
      title: 'Artificial Intelligence in Healthcare',
      researcherName: 'Rahul Sharma',
      status: 'SUBMITTED',
      submittedDate: '2026-07-31T09:30:00',
      assignedReviewers: 0
    },
    {
      reviewId: 102,
      paperId: 22,
      title: 'Cloud Security Using Zero Trust Architecture',
      researcherName: 'Ananya Rao',
      status: 'UNDER_REVIEW',
      submittedDate: '2026-07-29T14:15:00',
      assignedReviewers: 2
    },
    {
      reviewId: 103,
      paperId: 23,
      title: 'Blockchain-Based Academic Credential Verification',
      researcherName: 'Kiran Kumar',
      status: 'REVIEW_COMPLETED',
      submittedDate: '2026-07-27T11:00:00',
      assignedReviewers: 2
    },
    {
      reviewId: 104,
      paperId: 24,
      title: 'Machine Learning for Crop Disease Detection',
      researcherName: 'Priya Nair',
      status: 'REVISION_REQUESTED',
      submittedDate: '2026-07-25T10:20:00',
      assignedReviewers: 1
    }
  ]);

  readonly totalSubmissions = computed(
    () => this.queueItems().length
  );

  readonly unassignedCount = computed(
    () =>
      this.queueItems().filter(
        item => item.assignedReviewers === 0
      ).length
  );

  readonly underReviewCount = computed(
    () =>
      this.queueItems().filter(
        item => item.status === 'UNDER_REVIEW'
      ).length
  );

  readonly awaitingDecisionCount = computed(
    () =>
      this.queueItems().filter(
        item => item.status === 'REVIEW_COMPLETED'
      ).length
  );

  readonly recentItems = computed(() =>
    [...this.queueItems()]
      .sort(
        (a, b) =>
          new Date(b.submittedDate).getTime() -
          new Date(a.submittedDate).getTime()
      )
      .slice(0, 5)
  );

  formatStatus(status: string): string {
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getStatusClass(status: string): string {
    return `status--${status.toLowerCase().replaceAll('_', '-')}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
