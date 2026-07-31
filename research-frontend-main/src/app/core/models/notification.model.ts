import { NotificationType } from './notification-type.enum';

// Matches notificationservice DTOs
export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
}

export interface UpdateNotificationRequest {
  title: string;
  message: string;
  type: NotificationType;
}

export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}
