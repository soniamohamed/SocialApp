import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RepliesResponse, ReplyMutationResponse } from '../models/replies-data.interface';
import { environment } from '../../../../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RepliesService {
  private readonly httpClient=inject(HttpClient);
 


    GetCommentReplies(postId:string,commentId:string,page:number = 1,limit:number = 10):Observable<RepliesResponse>
    {
      return this.httpClient.get<RepliesResponse>(`${environment.base_url}/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`);
    }
     CreateReply(postId:string,commentId:string,data:FormData):Observable<ReplyMutationResponse>
    {
      return this.httpClient.post<ReplyMutationResponse>(`${environment.base_url}/posts/${postId}/comments/${commentId}/replies`,data);
    }
}
