import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CreateNotificationRequest, UpdateNotificationRequest, NotificationResponse } from '@core/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrls.notification;

  createNotification(request: CreateNotificationRequest): Observable<NotificationResponse> {
    return this.http.post<NotificationResponse>(this.baseUrl, request);
  }

  getAllNotifications(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this.baseUrl);
  }

  getNotificationById(id: number): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.baseUrl}/${id}`);
  }

  getNotificationsByUserId(userId: number): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.baseUrl}/user/${userId}`);
  }

  updateNotification(id: number, request: UpdateNotificationRequest): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(`${this.baseUrl}/${id}`, request);
  }

  markAsRead(id: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(`${this.baseUrl}/${id}/read`, {});
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getUnreadCount(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.baseUrl}/user/${userId}/unread-count`);
  }
}
