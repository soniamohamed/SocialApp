import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import { AuthService } from '../../core/auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit{
registerForm !: FormGroup;
private readonly authService=inject(AuthService);
private readonly router=inject(Router);
private readonly fb=inject(FormBuilder);
registerSub$ : Subscription=new Subscription();
errMsg:string='';
//isSubmitted:boolean = false;
loading:boolean = false;
// كل دورها باخد نسخه من registerform وتبدأ تنشا الكنترول
//باخلي الكود شكله مترتب 
//nonNullable عشان لما اعمل reset للفورم ماترجعش ب null ترجع سترنج فاضي
registerFormInit():void{ 
this.registerForm=this.fb.nonNullable.group({
  name:['',[Validators.required,Validators.minLength(3)]],
  username : [''], // optional
  email:['',[Validators.required,Validators.email]],
  dateOfBirth : ['',[Validators.required]],
  gender : ['',[Validators.required]],
  password :['',[Validators.required
  ,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
  rePassword  : ['',[Validators.required]]
},{ updateOn :'submit',
  validators:[this.confirmPassword]}
) ;
}
/*
new FormGroup({
    
   name :new FormControl('',[Validators.required,Validators.minLength(3)]),
  username :new FormControl('',[]), //optional
  email: new FormControl('',[Validators.required,Validators.email]),
  dateOfBirth : new FormControl('',[Validators.required]),
  gender : new FormControl('',[Validators.required]),
  password : new FormControl('',[Validators.required
  ,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]),
  rePassword  : new FormControl('',[Validators.required])
  
},{ updateOn :'submit',
  validators:[this.confirmPassword]}
) ;
}
*/
ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
//best practise
  this.registerFormInit();
}

submitForm(): void{
  //this.isSubmitted=true;
  if (this.registerForm.valid)
  {
    this.loading=true;
    this.registerSub$.unsubscribe();
   this.registerSub$= this.authService.signUp(this.registerForm.value).subscribe({
      next: (res)=>{
        if(res.success)
        {
          this.registerForm.reset();
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
//AbstractControl is base class inside it groupform,controleform,arrayform
confirmPassword(group:AbstractControl)

{
// check pass !== rePass set error in repass controle called[mismatch]
//else return nll or do nothing
const password=group.get('password')?.value;
const rePassword=group.get('rePassword')?.value;
if (password !== rePassword && rePassword!='')
{
  group.get('rePassword')?.setErrors({mismatch:true});
  return {mismatch:true};
}
else 
{
  return null;
}
}

showPassword(element:HTMLInputElement) :void
{
  if(element.type==="password")
  {
     element.type="text";
  }
  else
  {
    element.type="password";
  }
}
}
