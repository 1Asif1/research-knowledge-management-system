import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { ModuleHeaderComponent } from '@shared/components/module-header/module-header.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { NotificationService } from '@core/services/notification.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { NotificationResponse, notificationIcon } from '@core/models';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, ModuleHeaderComponent, LoadingSpinnerComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-module-header module="MODULE 6" title="Notifications"></app-module-header>

    <app-loading-spinner *ngIf="loading()" message="Loading notifications..."></app-loading-spinner>

    <div class="notice-error" *ngIf="error()">{{ error() }}</div>

    <section class="notice-list" *ngIf="!loading() && !error()">
      <article class="notice-item" [class.notice-item--highlight]="!notice.isRead" *ngFor="let notice of notifications()">
        <h3>
          <mat-icon>{{ icon(notice.type) }}</mat-icon>
          {{ notice.title }}
        </h3>
        <p>{{ notice.message }}</p>
        <small>{{ notice.createdAt | date: 'MMM d, y, h:mm a' }}</small>
      </article>
      <article class="notice-item" *ngIf="notifications().length === 0">
        <p>No notifications available.</p>
      </article>
    </section>
  `,
  styles: [`
    .notice-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .notice-item {
      border: 1px solid #dbe2ed;
      border-radius: 12px;
      background: #fff;
      padding: 16px 20px;
    }

    .notice-item--highlight {
      background: #fff5dc;
      border-color: #f1dfb4;
    }

    .notice-item h3 {
      margin: 0 0 8px;
      color: #bc8409;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .notice-item p {
      margin: 0 0 8px;
      color: #10284b;
      font-size: 18px;
      line-height: 1.45;
    }

    .notice-item small {
      color: #5a6a85;
      font-size: 14px;
    }

    .notice-error {
      border: 1px solid #dbe2ed;
      border-radius: 12px;
      background: #fff;
      padding: 16px 18px;
      color: #455677;
      font-size: 14px;
    }
  `]
})
export class NotificationsPageComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly notifications = signal<NotificationResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly icon = notificationIcon;

  constructor() {
    const user = this.tokenStorage.getUser();
    if (!user) {
      this.error.set('Please sign in to view notifications.');
      this.loading.set(false);
      return;
    }

    this.notificationService.getNotificationsByUserId(user.id).subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(error.status === 0 ? 'Notification service is not reachable.' : 'Unable to load notifications.');
      }
    });
  }
}
