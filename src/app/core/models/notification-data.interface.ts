export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: NotificationItem[];
  };
  meta: {
    pagination?: NotificationPagination;
  };
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  actor: NotificationActor;
  type: string;
  entityType: string;
  entityId: NotificationEntity | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationActor {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface NotificationEntity {
  _id: string;
  body?: string;
  content?: string;
}

export interface NotificationPagination {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
  total: number;
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

export interface NotificationMutationResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}
