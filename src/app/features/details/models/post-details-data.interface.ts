export interface PostDetailsDataResponse {
  success: boolean
  message: string
  data: PostDetailsData
}

export interface PostDetailsData {
  post: Post
}

export interface Post {
  _id: string
  body: string 
  image: string 
  privacy: string 
  user: User
  sharedPost: string
  likes: string[]
  createdAt: string
  commentsCount: number
  topComment: string
  sharesCount: number
  likesCount: number
  isShare: boolean
  id: string
  bookmarked: boolean
}

export interface User {
  _id: string 
  name: string 
  username: string 
  photo: string 
}


  

