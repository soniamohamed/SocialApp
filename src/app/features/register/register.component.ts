import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import { AuthService } from '../../core/auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-register',
  imports: [RouterLink,RouterLinkActive,ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
registerForm : FormGroup=new FormGroup({
    
   name :new FormControl('',[Validators.required,Validators.minLength(3)]),
  username :new FormControl('',[]), //optional
  email: new FormControl('',[Validators.required,Validators.email]),
  dateOfBirth : new FormControl('',[Validators.required]),
  gender : new FormControl('',[Validators.required]),
  password : new FormControl('',[Validators.required
  ,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),
  rePassword  : new FormControl('',[Validators.required])
  
},{updateOn :'submit'}) ;
private readonly authService=inject(AuthService);
private readonly router=inject(Router);
errMsg:string='';
//isSubmitted:boolean = false;
loading:boolean = false;
submitform(): void{
  //this.isSubmitted=true;
  if (this.registerForm.valid)
  {
    this.loading=true;
    this.authService.signUp(this.registerForm.value).subscribe({
      next: (res)=>{
        if(res.success)
        {
          this.loading=false;
          console.log(res);
         // redirect to login
          setTimeout(() => {
            this.router.navigate(['/login']);
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
    //console.log(this.registerForm.value);

  }
  else
    {
       this.loading=false;
      //show all errors to user
      
      this.registerForm.markAllAsTouched();
     
    }
  
}
}
