import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PostsDataResponse } from '../models/posts-data.interface';
import { PostMutationData, PostMutationDataResponse } from '../models/post-mutation-data.interface';
import { PostDetailsDataResponse } from '../../features/details/models/post-details-data.interface';


@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly httpClient=inject(HttpClient);
  // myHeaders : object=  { headers : {
  //        Authorization : `Bearer ${localStorage.getItem('socialToken')}` }};
  
  getAllPosts():Observable<PostsDataResponse>
  {
    return this.httpClient.get<PostsDataResponse>(`${environment.base_url}/posts`);
  }
  createPost(data:FormData):Observable<PostMutationDataResponse>
  {
    return this.httpClient.post<PostMutationDataResponse>(`${environment.base_url}/posts`,data);
  }
   //postdetails
   getSinglePost(postId:string):Observable<PostDetailsDataResponse>
  {
      return this.httpClient.get<PostDetailsDataResponse>(`${environment.base_url}/posts/${postId}`);
  }
   updatePost(postId:string,data:object):Observable<PostMutationDataResponse>
  {
     return this.httpClient.put<PostMutationDataResponse>(`${environment.base_url}/posts/${postId}`,data);
  }
   deletePost(postId:string):Observable<PostMutationDataResponse>
  {
    return this.httpClient.delete<PostMutationDataResponse>(`${environment.base_url}/posts/${postId}`);
  }
  LikeUnlikePost(postId:string):Observable<PostMutationDataResponse>
  {
    return this.httpClient.put<PostMutationDataResponse>(`${environment.base_url}/posts/${postId}/like`, {});
  }
  ToggleBookmark(postId:string):Observable<PostMutationDataResponse>
  {
    return this.httpClient.put<PostMutationDataResponse>(`${environment.base_url}/posts/${postId}/bookmark`, {});
  }
  

  }

  
