import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink,RouterLinkActive,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
// ctr +(.) Dot Add all missing imports
export class LoginComponent implements OnInit{ 
loginForm !: FormGroup;
private readonly authService=inject(AuthService);
private readonly router=inject(Router);
private readonly fb=inject(FormBuilder);
loginSub$ : Subscription=new Subscription();
errMsg:string='';
//isSubmitted:boolean = false;
loading:boolean = false;
// كل دورها باخد نسخه من loginform وتبدأ تنشا الكنترول
//باخلي الكود شكله مترتب 
//nonNullable عشان لما اعمل reset للفورم ماترجعش ب null ترجع سترنج فاضي

loginFormInit():void{ 
this.loginForm=this.fb.nonNullable.group({
email:['',[Validators.required,Validators.email]],
password :['',[Validators.required
,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
},{ updateOn :'submit'});

}

ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
//best practise
 
  this.loginFormInit();
}

showPassword(element:HTMLInputElement) :void 
{
  if(element.type==='password')
  {
      element.type='text'
  }
  else
    {
       element.type='password'
    }
}
submitForm(): void{
  //this.isSubmitted=true;
  if (this.loginForm.valid)
  {
    this.loading=true;
    this.loginSub$.unsubscribe();
   this.loginSub$= this.authService.signIn(this.loginForm.value).subscribe({
      next: (res)=>{
        if(res.success)
        {
          // save token
          localStorage.setItem('socialToken',res.data.token);
          //save user data
           localStorage.setItem('userData',JSON.stringify(res.data.user)); //JSON.stringify لان البيانات عباره عن اوبجكت عشان نحولها لسترنج 
         this.loginForm.reset();
          this.loading=false;
          console.log(res);
        // redirect to feed
          setTimeout(() => {
            this.router.navigate(['/feed']);
          }, 2000);
          

        }
       
      },
       error: (err:HttpErrorResponse)=>{
        this.loading=false;
        this.errMsg=err.error.message;
        console.log(err.error.message);
       
        //show errors
         
      },
      complete:()=>{
           this.loading=false;
      }
     
    });
    //console.log(this.loginForm.value);

  }
  else
    {
       this.loading=false;
      //show all errors to user
      
      this.loginForm.markAllAsTouched();
     
    }
  
}



}
