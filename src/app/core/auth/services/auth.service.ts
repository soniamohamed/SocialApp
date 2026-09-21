import { userData, UserInfo } from './../../models/user-data.interface';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDataResponse } from '../../models/user-data.interface';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient=inject(HttpClient);
  private readonly router=inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  readonly currentUser = signal<UserInfo | null>(this.getStoredUser());
  signUp(data:object) : Observable<UserDataResponse>{
    return this.httpClient.post<UserDataResponse>(  `${environment.base_url}/users/signup`,data);
  }
  signIn(data:object) : Observable<UserDataResponse>{
    return this.httpClient.post<UserDataResponse>(`${environment.base_url}/users/signin`,data);
  }
  setSession(data: userData): void {
    this.currentUser.set(data.user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('socialToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
    }
  }
    ChangePassword(oldPassword:string,newPassword:string): Observable<UserDataResponse>{
    return this.httpClient.patch<UserDataResponse>(`${environment.base_url}/users/change-password`,
      {
        password: oldPassword,
        newPassword: newPassword
      }
      );
  }
  
  signOut() :void{
    this.currentUser.set(null);
    // delete token && userData
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('socialToken');
      localStorage.removeItem('userData');
    }
    // redirect to login
    this.router.navigate(['/login']);
  }

  private getStoredUser(): UserInfo | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const storedUser = localStorage.getItem('userData');
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser) as UserInfo;
    } catch {
      localStorage.removeItem('userData');
      return null;
    }
  }

}
