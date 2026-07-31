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
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
