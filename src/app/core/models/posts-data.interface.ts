export interface PostsDataResponse {
  success: boolean;
  message: string;
  data: PostsData;
  meta: Meta;
}

export interface PostsData {
  posts: Post[];
}

export interface Post {
  _id: string;
  privacy: string;
  user: User;
  sharedPost?: SharedPost | null;

  likes: string[];
  createdAt: string;

  commentsCount: number;
  topComment?: TopComment;

  sharesCount: number;
  likesCount: number;

  isShare: boolean;
  id: string;

  bookmarked: boolean;

  body?: string;
  image?: string;
}

export interface SharedPost {
  _id: string;

  body?: string;
  image?: string;

  privacy: string;
  user: User;

  sharedPost?: SharedPost | null;

  likes: string[];

  createdAt: string;

  commentsCount: number;
  topComment?: TopComment;

  sharesCount: number;
  likesCount: number;

  isShare: boolean;
  id: string;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface TopComment {
  _id: string;

  content?: string;
  image?: string;

  commentCreator: User;

  post: string;
  parentComment: string | null;

  likes: string[];

  createdAt: string;
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
  total: number;
}