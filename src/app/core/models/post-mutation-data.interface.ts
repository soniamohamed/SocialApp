export interface PostMutationDataResponse {
   success: boolean;
   message: string;
   data: PostMutationData;
}

export interface PostMutationData {
   post: Post;
}

export interface PostUpdateDataResponse {
   success: boolean;
   message: string;
   data?: { post?: Partial<Post> };
}

export interface UpdatedPostBody {
   body: string;
   message: string;
}

export interface Post {
   _id: string;
   id: string;
   body: string;
   image: string;
   privacy:string;
   user: string;
   sharedPost:null; 
   likes:string[];  
   likesCount: number;
   bookmarked?: boolean;
   isShare: boolean;
   createdAt: string;
}
