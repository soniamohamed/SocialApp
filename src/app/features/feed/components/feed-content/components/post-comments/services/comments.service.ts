import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../../../../environments/environment';
import { Observable } from 'rxjs';
import { CommentsResponse,CommentMutationDataResponse} from '../models/commentsData.interface';


@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly httpClient=inject(HttpClient);
 


    getPostComments(postId:string,page:number = 1,limit:number = 10):Observable<CommentsResponse>
    {
      return this.httpClient.get<CommentsResponse>(`${environment.base_url}/posts/${postId}/comments?page=${page}&limit=${limit}`);
    }
     createComment(postId:string,data:FormData):Observable<CommentMutationDataResponse>
      {
        return this.httpClient.post<CommentMutationDataResponse>(`${environment.base_url}/posts/${postId}/comments`,data);
      }


     updateComment(postId:string,commentId :string,data :FormData):Observable<CommentMutationDataResponse>
      {
      return this.httpClient.put<CommentMutationDataResponse>(`${environment.base_url}/posts/${postId}/comments/${commentId}`,data);
      }

      deleteComment(postId:string,commentId :string):Observable<CommentMutationDataResponse>
      {
      return this.httpClient.delete<CommentMutationDataResponse>(`${environment.base_url}/posts/${postId}/comments/${commentId}`);
      }
      
     likeUnlikeComment(postId: string, commentId: string): Observable<CommentMutationDataResponse> {
      return this.httpClient.put<CommentMutationDataResponse>( `${environment.base_url}/posts/${postId}/comments/${commentId}/like`,
    {}, // لو الـ PUT محتاج body ابعته هنا، لو مش محتاج حط object فاضي
    {
      responseType: 'json' // <--- السطر ده هو اللي بيحل مشكلة الـ ArrayBuffer نهائياً
    }
  );
}
      
}
