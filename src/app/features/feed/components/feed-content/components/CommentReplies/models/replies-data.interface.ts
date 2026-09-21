import { Comment } from '../../post-comments/models/commentsData.interface';

export interface RepliesResponse {
  success: boolean;
  message: string;
  data: {
    replies: Comment[];
  };
  meta: {
    pagination: {
      currentPage: number;
      limit: number;
      total: number;
      numberOfPages: number;
    };
  };
}

export interface ReplyMutationResponse {
  success: boolean;
  message: string;
  data: {
    reply?: Comment;
    comment?: Comment;
  };
}
