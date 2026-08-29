import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const guestGuard: CanActivateFn = (route, state) => {
  //check if token exist --redirect feed else true return login 
  const token =localStorage.getItem('socialToken');
  const router=inject(Router); // fun ماينفعش استخدم فيه private زي ماباعملها ف الكلاس 
  if(token)
  {
    return router.parseUrl('/feed');
  }
  else
  {
   return true;
  }
};
