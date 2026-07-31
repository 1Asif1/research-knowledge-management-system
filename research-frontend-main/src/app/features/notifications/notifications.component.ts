import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import {
  AppNotification,
  NotificationType
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
export class NotificationsComponent {
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly selectedFilter = signal<NotificationFilter>('ALL');

  readonly notifications = signal<AppNotification[]>([
    {
      id: 1,
      recipientId: 4,
      title: 'New paper assigned',
      message:
        'You have been assigned to review "Artificial Intelligence in Healthcare".',
      type: 'ASSIGNMENT',
      read: false,
      createdAt: new Date(
        Date.now() - 2 * 60 * 60 * 1000
      ).toISOString(),
      actionUrl: '/reviewer/assigned-papers'
    },
    {
      id: 2,
      recipientId: 4,
      title: 'Paper revision submitted',
      message:
        'The researcher uploaded version 2 of an assigned paper.',
      type: 'REVISION',
      read: false,
      createdAt: new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString(),
      actionUrl: '/reviewer/assigned-papers'
    },
    {
      id: 3,
      recipientId: 4,
      title: 'Review deadline approaching',
      message:
        'Your review is due in two days. Please submit your recommendation.',
      type: 'REMINDER',
      read: false,
      createdAt: new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString(),
      actionUrl: '/reviewer/assigned-papers'
    },
    {
      id: 4,
      recipientId: 4,
      title: 'Review submitted successfully',
      message:
        'Your recommendation has been recorded successfully.',
      type: 'SUCCESS',
      read: true,
      createdAt: new Date(
        Date.now() - 4 * 24 * 60 * 60 * 1000
      ).toISOString(),
      actionUrl: '/reviewer/reviewed-papers'
    },
    {
      id: 5,
      recipientId: 4,
      title: 'System notification',
      message:
        'Your profile information was updated successfully.',
      type: 'INFO',
      read: true,
      createdAt: new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString()
    }
  ]);

  readonly filteredNotifications = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const filter = this.selectedFilter();

    return this.notifications()
      .filter((notification) => {
        if (filter === 'UNREAD' && notification.read) {
          return false;
        }

        if (filter === 'READ' && !notification.read) {
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
        (notification) => !notification.read
      ).length
  );

  readonly assignmentCount = computed(
    () =>
      this.notifications().filter(
        (notification) =>
          notification.type === 'ASSIGNMENT'
      ).length
  );

  updateSearch(value: string): void {
    this.searchTerm.set(value);
  }

  updateFilter(value: NotificationFilter): void {
    this.selectedFilter.set(value);
  }

  markAsRead(notificationId: number): void {
    this.notifications.update((notifications) =>
      notifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true
            }
          : notification
      )
    );
  }

  markAllAsRead(): void {
    this.notifications.update((notifications) =>
      notifications.map((notification) => ({
        ...notification,
        read: true
      }))
    );
  }

  refreshNotifications(): void {
    this.loading.set(true);

    setTimeout(() => {
      this.loading.set(false);
    }, 500);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedFilter.set('ALL');
  }

  getNotificationIcon(type: NotificationType): string {
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

  getNotificationClass(type: NotificationType): string {
    return `notification-icon--${type.toLowerCase()}`;
  }

  getActionLabel(type: NotificationType): string {
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
}
