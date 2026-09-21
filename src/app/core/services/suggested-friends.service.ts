import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FollowUserResponse, SuggestedFriendsResponse, UserSearchResponse } from '../models/suggested-friends-data.interface';

@Injectable({
  providedIn: 'root',
})
export class SuggestedFriendsService {

    private readonly httpClient=inject(HttpClient);

       GetFollowSuggestions(page = 1, limit = 5, search = ''): Observable<SuggestedFriendsResponse>
        {
            const params = new HttpParams().set('page', page).set('limit', limit);
            const query = search.trim().replace(/^@/, '').trim();
            // The official demo's Feed switches to user search for non-empty queries.
            if (query) {
              return this.httpClient.get<UserSearchResponse>(`${environment.base_url}/users/search`, {
                params: params.set('q', query),
              }).pipe(map(response => ({
                ...response,
                data: { suggestions: response.data.users },
              })));
            }
            return this.httpClient.get<SuggestedFriendsResponse>(`${environment.base_url}/users/suggestions`, { params });
        }
        FollowUnfollowUser(userId:string): Observable<FollowUserResponse>
        {
          return this.httpClient.put<FollowUserResponse>(`${environment.base_url}/users/${userId}/follow`,{});
        }
        
}
