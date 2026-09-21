import { Pagination } from './posts-data.interface';

export interface SuggestedFriendsResponse {
  success: boolean;
  message: string;
  data: {
    suggestions: SuggestedFriend[];
  };
  meta: {
    pagination: Pagination;
  };
}

export interface SuggestedFriend {
  _id: string;
  name: string;
  username: string;
  photo: string;
  followersCount?: number;
}

export interface UserSearchResponse extends Omit<SuggestedFriendsResponse, 'data'> {
  data: {
    users: SuggestedFriend[];
  };
}

export interface FollowUserResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}
