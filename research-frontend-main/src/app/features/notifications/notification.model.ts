export type NotificationType =
  | 'ASSIGNMENT'
  | 'SUBMISSION'
  | 'REVISION'
  | 'DECISION'
  | 'REMINDER'
  | 'SUCCESS'
  | 'INFO';

export interface AppNotification {
  id: number;
  recipientId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
