import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
// if(req.url.includes('posts')){
//   if(token)
//   {
//      req=req.clone({
//          setHeaders : { Authorization : `Bearer ${token}` }
//      });
//   }
// }
//REQ

  return next(req).pipe(catchError((err)=>{ //Res
    //logic error
    console.log(err);
    return throwError(()=>err) } ) ) ;
  };
   


