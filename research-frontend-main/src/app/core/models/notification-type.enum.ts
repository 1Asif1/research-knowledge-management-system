// Matches notificationservice.model.NotificationType
export enum NotificationType {
  PAPER_SUBMITTED = 'PAPER_SUBMITTED',
  REVIEW_ASSIGNED = 'REVIEW_ASSIGNED',
  REVIEW_COMPLETED = 'REVIEW_COMPLETED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  PAPER_APPROVED = 'PAPER_APPROVED',
  PAPER_REJECTED = 'PAPER_REJECTED',
  PAPER_PUBLISHED = 'PAPER_PUBLISHED'
}

export function notificationIcon(type: NotificationType | string): string {
  switch (type) {
    case NotificationType.PAPER_SUBMITTED: return 'upload_file';
    case NotificationType.REVIEW_ASSIGNED: return 'assignment_ind';
    case NotificationType.REVIEW_COMPLETED: return 'fact_check';
    case NotificationType.REVISION_REQUESTED: return 'edit_note';
    case NotificationType.PAPER_APPROVED: return 'check_circle';
    case NotificationType.PAPER_REJECTED: return 'cancel';
    case NotificationType.PAPER_PUBLISHED: return 'menu_book';
    default: return 'notifications';
  }
}
