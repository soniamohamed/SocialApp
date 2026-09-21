import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FollowUserResponse, SuggestedFriendsResponse } from '../models/suggested-friends-data.interface';

@Injectable({
  providedIn: 'root',
})
export class SuggestedFriendsService {

    private readonly httpClient=inject(HttpClient);

       GetFollowSuggestions(page = 1, limit = 5): Observable<SuggestedFriendsResponse>
        {
            const params = new HttpParams().set('page', page).set('limit', limit);
            return this.httpClient.get<SuggestedFriendsResponse>(`${environment.base_url}/users/suggestions`, { params });
        }
        FollowUnfollowUser(userId:string): Observable<FollowUserResponse>
        {
          return this.httpClient.put<FollowUserResponse>(`${environment.base_url}/users/${userId}/follow`,{});
        }
        
}
