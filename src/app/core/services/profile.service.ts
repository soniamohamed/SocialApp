import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PostsDataResponse } from '../models/posts-data.interface';
import { BookmarksResponse, ProfileResponse } from '../models/profile-data.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly httpClient=inject(HttpClient);


GetMyProfile(): Observable<ProfileResponse>
      {
        return this.httpClient.get<ProfileResponse>(`${environment.base_url}/users/profile-data`);
      }

   GetUserProfile(userId:string): Observable<any>
    {
        return this.httpClient.get<any>(`${environment.base_url}/users/${userId}/profile`);
    }
    UploadProfilePhoto(photo:File): Observable<any>
    {
        return this.httpClient.put<any>(`${environment.base_url}/users/upload-photo`,photo);
    }
     GetBookmarks(): Observable<BookmarksResponse>
    {
        return this.httpClient.get<BookmarksResponse>(`${environment.base_url}/users/bookmarks`);
    }
    GetMyPosts(): Observable<PostsDataResponse>
    {
        return this.httpClient.get<PostsDataResponse>(`${environment.base_url}/posts/feed?only=me&page=1&limit=50`);
    }
    
}
