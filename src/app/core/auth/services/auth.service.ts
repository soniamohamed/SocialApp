import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDataResponse } from '../../models/user-data.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient=inject(HttpClient);
  private readonly baseUrl = 'https://route-posts.routemisr.com';
  signUp(data:object) : Observable<UserDataResponse>{
    return this.httpClient.post<UserDataResponse>(  `${this.baseUrl}/users/signup`,data);
  }
  signIn(data:object) : Observable<UserDataResponse>{
    return this.httpClient.post<UserDataResponse>('${this.baseUrl}/users/signin',data);
  }
}
