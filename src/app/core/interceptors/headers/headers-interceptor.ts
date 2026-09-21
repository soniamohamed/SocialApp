import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
const platformId = inject(PLATFORM_ID);
const token = isPlatformBrowser(platformId) ? localStorage.getItem('socialToken') : null;
if(
  req.url.includes('posts') ||
  req.url.includes('/notifications') ||
  req.url.includes('/users/profile-data') ||
  req.url.includes('/users/bookmarks') ||
  req.url.includes('/users/suggestions') ||
  /\/users\/[^/]+\/follow(?:\?|$)/.test(req.url)
){
  if(token)
  {
     req=req.clone({
         setHeaders : { Authorization : `Bearer ${token}` }
     });
  }
}
  return next(req);
};
