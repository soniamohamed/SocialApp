import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { NotificationItem } from '../../core/models/notification-data.interface';
import { NotificationsService } from '../../core/services/notifications.service';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);

  readonly allNotifications = this.notificationsService.notifications;
  readonly unreadCount = this.notificationsService.unreadCount;
  activeFilter: 'all' | 'unread' = 'all';
  isLoading = false;
  isMarkingAll = false;
  errorMessage = '';
  readonly markingRead = new Set<string>();

  get visibleNotifications(): NotificationItem[] {
    return this.activeFilter === 'unread'
      ? this.allNotifications().filter((notification) => !notification.isRead)
      : this.allNotifications();
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationsService.LoadNotificationsState()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Unable to load notifications.';
        },
      });
  }

  setFilter(filter: 'all' | 'unread'): void {
    this.activeFilter = filter;
  }

  markAsRead(notification: NotificationItem): void {
    if (notification.isRead || this.markingRead.has(notification._id)) return;

    this.markingRead.add(notification._id);
    this.errorMessage = '';
    this.notificationsService.MarkNotificationAsRead(notification._id)
      .pipe(finalize(() => this.markingRead.delete(notification._id)))
      .subscribe({
        next: () => {
          this.notificationsService.MarkOneReadInState(notification._id);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Unable to mark this notification as read.';
        },
      });
  }

  markAllAsRead(): void {
    if (this.unreadCount() === 0 || this.isMarkingAll) return;

    this.isMarkingAll = true;
    this.errorMessage = '';
    this.notificationsService.MarkAllAsRead()
      .pipe(finalize(() => (this.isMarkingAll = false)))
      .subscribe({
        next: () => {
          this.notificationsService.MarkAllReadInState();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Unable to mark all notifications as read.';
        },
      });
  }

  relatedContent(notification: NotificationItem): string {
    return notification.entityId?.body || notification.entityId?.content || '';
  }

  notificationIcon(type: string): string {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('comment') || normalizedType.includes('reply')) return 'fa-regular fa-comment';
    if (normalizedType.includes('like')) return 'fa-regular fa-thumbs-up';
    if (normalizedType.includes('follow')) return 'fa-solid fa-user-plus';
    if (normalizedType.includes('share')) return 'fa-solid fa-share';
    return 'fa-regular fa-bell';
  }

  relativeTime(createdAt: string): string {
    const elapsedMilliseconds = Date.now() - new Date(createdAt).getTime();
    if (!Number.isFinite(elapsedMilliseconds) || elapsedMilliseconds < 0) return 'now';

    const minutes = Math.floor(elapsedMilliseconds / 60_000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    return `${Math.floor(hours / 24)}d`;
  }
}
