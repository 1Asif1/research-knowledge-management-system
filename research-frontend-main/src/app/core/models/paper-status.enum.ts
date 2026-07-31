// Matches PaperService.Enum.PaperStatus
export enum PaperStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REVISIONS_REQUIRED = 'REVISIONS_REQUIRED',
  REJECTED = 'REJECTED'
}

export function paperStatusLabel(status: PaperStatus | string | null | undefined): string {
  switch (status) {
    case PaperStatus.DRAFT: return 'Draft';
    case PaperStatus.SUBMITTED: return 'Submitted';
    case PaperStatus.UNDER_REVIEW: return 'Under Review';
    case PaperStatus.APPROVED: return 'Approved';
    case PaperStatus.REVISIONS_REQUIRED: return 'Revisions Required';
    case PaperStatus.REJECTED: return 'Rejected';
    default: return status ?? '—';
  }
}

// Maps a status to a visual intent used by the StatusBadge component.
export type StatusIntent = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function paperStatusIntent(status: PaperStatus | string | null | undefined): StatusIntent {
  switch (status) {
    case PaperStatus.APPROVED: return 'success';
    case PaperStatus.UNDER_REVIEW: return 'info';
    case PaperStatus.SUBMITTED: return 'info';
    case PaperStatus.REVISIONS_REQUIRED: return 'warning';
    case PaperStatus.REJECTED: return 'danger';
    case PaperStatus.DRAFT: return 'neutral';
    default: return 'neutral';
  }
}
