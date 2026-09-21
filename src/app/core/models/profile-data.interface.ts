import { Post, Meta } from './posts-data.interface';

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: ProfileUser;
  };
}

export interface ProfileUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  photo: string;
  cover?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  createdAt?: string;
}

export interface BookmarksResponse {
  success: boolean;
  message: string;
  data: {
    bookmarks: Post[];
  };
  meta?: Meta;
}
