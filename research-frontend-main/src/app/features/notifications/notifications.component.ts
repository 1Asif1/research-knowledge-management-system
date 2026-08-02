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
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { forkJoin } from 'rxjs';

import { NotificationService } from '@core/services/notification.service';
import { TokenStorageService } from '@core/services/token-storage.service';
import { NotificationResponse, NotificationType as BackendNotificationType, Role } from '@core/models';
import { SnackbarService } from '@shared/services/snackbar.service';

import {
  AppNotification,
  NotificationType as AppNotificationType
} from './notification.model';

type NotificationFilter = 'ALL' | 'UNREAD' | 'READ';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly snackbar = inject(SnackbarService);

  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly selectedFilter = signal<NotificationFilter>('ALL');
  readonly notifications = signal<AppNotification[]>([]);

  readonly filteredNotifications = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const filter = this.selectedFilter();

    return this.notifications()
      .filter((notification) => {
        if (filter === 'UNREAD' && notification.isRead) {
          return false;
        }

        if (filter === 'READ' && !notification.isRead) {
          return false;
        }

        return true;
      })
      .filter((notification) => {
        if (!search) {
          return true;
        }

        return (
          notification.title.toLowerCase().includes(search) ||
          notification.message.toLowerCase().includes(search) ||
          notification.type.toLowerCase().includes(search)
        );
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime()
      );
  });

  readonly totalCount = computed(
    () => this.notifications().length
  );

  readonly unreadCount = computed(
    () =>
      this.notifications().filter(
        (notification) => !notification.isRead
      ).length
  );

  readonly assignmentCount = computed(
    () =>
      this.notifications().filter(
        (notification) =>
          notification.type === 'ASSIGNMENT'
      ).length
  );

  ngOnInit(): void {
    this.loadNotifications();
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateFilter(value: NotificationFilter): void {
    this.selectedFilter.set(value);
  }

  markAsRead(notificationId: number): void {
    const target = this.notifications().find((notification) => notification.id === notificationId);
    if (!target || target.isRead) {
      return;
    }

    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.notifications.update((notifications) =>
          notifications.map((notification) =>
            notification.id === notificationId
              ? {
                ...notification,
                isRead: true
              }
              : notification
          )
        );
      },
      error: (error: HttpErrorResponse) => {
        this.snackbar.error(error.error?.message ?? 'Failed to update notification.');
      }
    });
  }

  markAllAsRead(): void {
    const unreadIds = this.notifications()
      .filter((notification) => !notification.isRead)
      .map((notification) => notification.id);

    if (!unreadIds.length) {
      return;
    }

    this.loading.set(true);
    forkJoin(unreadIds.map((id) => this.notificationService.markAsRead(id))).subscribe({
      next: () => {
        this.notifications.update((notifications) =>
          notifications.map((notification) => ({
            ...notification,
            isRead: true
          }))
        );
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.snackbar.error(error.error?.message ?? 'Failed to mark all notifications as read.');
      }
    });
  }

  refreshNotifications(): void {
    this.loadNotifications();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedFilter.set('ALL');
  }

  getNotificationIcon(type: AppNotificationType): string {
    switch (type) {
      case 'ASSIGNMENT':
        return 'assignment';
      case 'SUBMISSION':
        return 'upload_file';
      case 'REVISION':
        return 'published_with_changes';
      case 'DECISION':
        return 'gavel';
      case 'REMINDER':
        return 'schedule';
      case 'SUCCESS':
        return 'verified';
      case 'INFO':
      default:
        return 'notifications';
    }
  }

  getNotificationClass(type: AppNotificationType): string {
    return `notification-icon--${type.toLowerCase()}`;
  }

  getActionLabel(type: AppNotificationType): string {
    switch (type) {
      case 'ASSIGNMENT':
        return 'View Assignment';
      case 'SUBMISSION':
        return 'View Submission';
      case 'REVISION':
        return 'View Revision';
      case 'DECISION':
        return 'View Decision';
      case 'REMINDER':
        return 'Open Review';
      case 'SUCCESS':
        return 'View Details';
      default:
        return 'Open';
    }
  }

  getRelativeTime(createdAt: string): string {
    const createdTime = new Date(createdAt).getTime();
    const currentTime = Date.now();
    const difference = currentTime - createdTime;

    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(
      difference / (1000 * 60 * 60 * 24)
    );

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    if (days === 1) {
      return 'Yesterday';
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return new Date(createdAt).toLocaleDateString();
  }

  private loadNotifications(): void {
    const user = this.tokenStorage.getUser();
    if (!user) {
      this.notifications.set([]);
      this.snackbar.error('Your session has expired. Please sign in again.');
      return;
    }

    this.loading.set(true);
    this.notificationService.getNotificationsByUserId(user.id).subscribe({
      next: (responses: NotificationResponse[]) => {
        this.notifications.set(responses.map((response) => this.mapNotification(response, user.role)));
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.notifications.set([]);
        this.snackbar.error(error.error?.message ?? 'Failed to load notifications.');
      }
    });
  }

  private mapNotification(response: NotificationResponse, role: Role): AppNotification {
    return {
      id: response.id,
      recipientId: response.userId,
      title: response.title,
      message: response.message,
      type: this.mapNotificationType(response.type),
      isRead: response.isRead,
      createdAt: response.createdAt,
      actionUrl: this.resolveActionUrl(role, response.type)
    };
  }

  private mapNotificationType(type: BackendNotificationType): AppNotificationType {
    switch (type) {
      case BackendNotificationType.REVIEW_ASSIGNED:
        return 'ASSIGNMENT';
      case BackendNotificationType.PAPER_SUBMITTED:
        return 'SUBMISSION';
      case BackendNotificationType.REVISION_REQUESTED:
      case BackendNotificationType.PAPER_RESUBMITTED:
        return 'REVISION';
      case BackendNotificationType.PAPER_APPROVED:
      case BackendNotificationType.PAPER_REJECTED:
        return 'DECISION';
      case BackendNotificationType.REVIEW_COMPLETED:
      case BackendNotificationType.PAPER_PUBLISHED:
        return 'SUCCESS';
      default:
        return 'INFO';
    }
  }

  private resolveActionUrl(
    role: Role,
    type: BackendNotificationType
  ): string {
    if (role === Role.REVIEWER) {
<<<<<<< HEAD
      switch (type) {
        case BackendNotificationType.REVIEW_ASSIGNED:
          return '/reviewer/assigned-papers';

        case BackendNotificationType.REVIEW_COMPLETED:
          return '/reviewer/reviewed-papers';

        default:
          return '/reviewer/dashboard';
      }
=======
      return type === BackendNotificationType.REVIEW_ASSIGNED || type === BackendNotificationType.PAPER_RESUBMITTED
        ? '/reviewer/assigned-papers'
        : '/reviewer/dashboard';
>>>>>>> 8174198 (added report service implementation and fixed admin and re-recommendations)
    }

    if (role === Role.EDITOR) {
      switch (type) {
        case BackendNotificationType.REVIEW_COMPLETED:
          return '/editor/decisions';

        case BackendNotificationType.PAPER_SUBMITTED:
          return '/editor/papers';

        case BackendNotificationType.PAPER_PUBLISHED:
          return '/editor/published-papers';

        default:
          return '/editor/dashboard';
      }
    }

    if (role === Role.ADMIN) {
      return '/admin/dashboard';
    }

    return '/researcher/papers';
  }
}
