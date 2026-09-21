import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpParams } from '@angular/common/http';
import {
  NotificationMutationResponse,
  NotificationItem,
  NotificationsResponse,
  UnreadCountResponse,
} from '../models/notification-data.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
   private readonly httpClient=inject(HttpClient);
   private notificationsRequest?: Observable<NotificationsResponse>;

  readonly notifications = signal<NotificationItem[]>([]);
  readonly unreadCount = computed(() =>
    this.notifications().filter((notification) => !notification.isRead).length,
  );

  LoadNotificationsState(): Observable<NotificationsResponse> {
    if (!this.notificationsRequest) {
      this.notificationsRequest = this.GetNotifications(undefined, 1, 50).pipe(
        tap((response) => this.notifications.set(response.data.notifications)),
        catchError((error) => {
          this.notificationsRequest = undefined;
          return throwError(() => error);
        }),
        shareReplay(1),
      );
    }

    return this.notificationsRequest;
  }

  MarkOneReadInState(notificationId: string): void {
    this.notifications.update((notifications) =>
      notifications.map((notification) =>
        notification._id === notificationId ? { ...notification, isRead: true } : notification,
      ),
    );
  }

  MarkAllReadInState(): void {
    this.notifications.update((notifications) =>
      notifications.map((notification) => ({ ...notification, isRead: true })),
    );
  }

  GetNotifications(unread?: boolean, page = 1, limit = 50): Observable<NotificationsResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (unread !== undefined) {
      params = params.set('unread', unread);
    }

    return this.httpClient.get<NotificationsResponse>(
      `${environment.base_url}/notifications`,
      { params },
    );
  }

  GetUnreadCount(): Observable<UnreadCountResponse> {
    return this.httpClient.get<UnreadCountResponse>(
      `${environment.base_url}/notifications/unread-count`,
    );
  }

  MarkNotificationAsRead(notificationId: string): Observable<NotificationMutationResponse> {
    return this.httpClient.patch<NotificationMutationResponse>(
      `${environment.base_url}/notifications/${notificationId}/read`,
      {},
    );
  }

  MarkAllAsRead(): Observable<NotificationMutationResponse> {
    return this.httpClient.patch<NotificationMutationResponse>(
      `${environment.base_url}/notifications/read-all`,
      {},
    );
  }
   
   
}
