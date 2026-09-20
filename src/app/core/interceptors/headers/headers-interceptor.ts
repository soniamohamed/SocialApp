import { HttpInterceptorFn } from '@angular/common/http';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
const token=localStorage.getItem('socialToken');
if(req.url.includes('posts')){
  if(token)
  {
     req=req.clone({
         setHeaders : { Authorization : `Bearer ${token}` }
     });
  }
}
  return next(req);
};
