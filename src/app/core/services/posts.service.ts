import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PostsDataResponse } from '../models/posts-data.interface';
import { PostMutationDataResponse, PostUpdateDataResponse, UpdatedPostBody } from '../models/post-mutation-data.interface';
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
   updatePost(postId: string, editedBody: string): Observable<UpdatedPostBody>
  {
    const body = editedBody.trim();
    if (!body) return throwError(() => new Error('Post text cannot be empty.'));

    // The official demo uses JSON for text-only edits; no media or privacy fields.
    return this.httpClient.put<PostUpdateDataResponse>(`${environment.base_url}/posts/${postId}`, { body })
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Unable to update this post. Please try again.');
        }
        const returnedBody = response.data?.post?.body;
        return {
          body: typeof returnedBody === 'string' ? returnedBody : body,
          message: response.message,
        };
      }));
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

  
