// Matches ReviewService.Enums.*
import { StatusIntent } from './paper-status.enum';

export enum ReviewStatus {
  SYNC_PENDING = 'SYNC_PENDING',
  SUBMITTED = 'SUBMITTED',
  REVIEWER_ASSIGNED = 'REVIEWER_ASSIGNED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CORRECTION_REQUESTED = 'CORRECTION_REQUESTED',
  RESUBMITTED = 'RESUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SENT_TO_PUBLICATION = 'SENT_TO_PUBLICATION'
}

export enum ReviewerRecommendation {
  ACCEPT = 'ACCEPT',
  MINOR_REVISION = 'MINOR_REVISION',
  MAJOR_REVISION = 'MAJOR_REVISION',
  REJECT = 'REJECT'
}

export enum EditorDecision {
  PENDING = 'PENDING',
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT'
}

export enum AssignmentStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  COMPLETED = 'COMPLETED'
}

export function reviewStatusLabel(status: ReviewStatus | string | null | undefined): string {
  switch (status) {
    case ReviewStatus.SYNC_PENDING: return 'Sync Pending';
    case ReviewStatus.SUBMITTED: return 'Submitted';
    case ReviewStatus.REVIEWER_ASSIGNED: return 'Reviewer Assigned';
    case ReviewStatus.UNDER_REVIEW: return 'Under Review';
    case ReviewStatus.CORRECTION_REQUESTED: return 'Correction Requested';
    case ReviewStatus.RESUBMITTED: return 'Resubmitted';
    case ReviewStatus.APPROVED: return 'Approved';
    case ReviewStatus.REJECTED: return 'Rejected';
    case ReviewStatus.SENT_TO_PUBLICATION: return 'Published';
    default: return status ?? '—';
  }
}

export function reviewStatusIntent(status: ReviewStatus | string | null | undefined): StatusIntent {
  switch (status) {
    case ReviewStatus.APPROVED:
    case ReviewStatus.SENT_TO_PUBLICATION: return 'success';
    case ReviewStatus.UNDER_REVIEW:
    case ReviewStatus.REVIEWER_ASSIGNED:
    case ReviewStatus.RESUBMITTED: return 'info';
    case ReviewStatus.CORRECTION_REQUESTED: return 'warning';
    case ReviewStatus.SYNC_PENDING: return 'warning';
    case ReviewStatus.REJECTED: return 'danger';
    case ReviewStatus.SUBMITTED: return 'neutral';
    default: return 'neutral';
  }
}

export function recommendationLabel(rec: ReviewerRecommendation | string | null | undefined): string {
  switch (rec) {
    case ReviewerRecommendation.ACCEPT: return 'Accept';
    case ReviewerRecommendation.MINOR_REVISION: return 'Minor Revision';
    case ReviewerRecommendation.MAJOR_REVISION: return 'Major Revision';
    case ReviewerRecommendation.REJECT: return 'Reject';
    default: return '—';
  }
}

export function editorDecisionLabel(decision: EditorDecision | string | null | undefined): string {
  switch (decision) {
    case EditorDecision.ACCEPT: return 'Accepted';
    case EditorDecision.REJECT: return 'Rejected';
    case EditorDecision.PENDING: return 'Pending';
    default: return '—';
  }
}
