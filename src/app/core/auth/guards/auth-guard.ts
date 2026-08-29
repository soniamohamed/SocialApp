import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  //check if token exist --true else false
  const token =localStorage.getItem('socialToken');
  const router=inject(Router); // fun ماينفعش استخدم فيه private زي ماباعملها ف الكلاس 
  if(token)
  {
      return true;
  }
  else
  {
    // router.navigate(['/login']);
    //   return false; // الطريقه دي مش مفضله 
    // الافضل create url tree && parse url tree هابحث عن الفرق بينهم 
    //return UrlTree
    return router.parseUrl('/login');
  }
 
};
