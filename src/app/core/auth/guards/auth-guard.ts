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
    // الافضل create url tree && parse url tree هابحث عن الفرق بينهم 
    return router.parseUrl('/login');
  }
 
};
