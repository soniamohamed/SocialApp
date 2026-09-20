export interface CommentsResponse {
  success: boolean;
  message: string;
  data: CommentsData;
  meta: Meta;
}

export interface CommentsData {
  comments: Comment[];
}

export interface CommentMutationDataResponse {
  success: boolean;
  message: string;
  data: CommentMutationData;
}

export interface CommentMutationData {
  comment: Comment;
}

export interface Comment {
  _id: string;
  id?: string;
  content: string;
  image?: string | null;
  commentCreator: CommentCreator;
  post: string;
  parentComment: string | null;
  likes: string[];
  createdAt: string;
  repliesCount?: number;
  likesCount?: number;
  isReply?: boolean;
}

export interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  id?: string;
}

export interface Meta {
  pagination: Pagination;
}

export interface Pagination {
  currentPage: number;
  limit: number;
  total: number;
  numberOfPages: number;
}