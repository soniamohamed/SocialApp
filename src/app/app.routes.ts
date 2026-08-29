import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { ForgetPasswordComponent } from './features/forget-password/forget-password.component';
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { FeedComponent } from './features/feed/feed.component';
import { ProfileComponent } from './features/profile/profile.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { authGuard } from './core/auth/guards/auth-guard';
import { guestGuard } from './core/auth/guards/guest-guard';

export const routes: Routes = [
{   path:'',
    redirectTo:'login',
    pathMatch:'full',
},
    {
    path:'' ,
    component:AuthLayoutComponent
    ,canActivate:[guestGuard]
    ,children: [
    {
        path:'login',
        component:LoginComponent
    },
    {
        path:'register',
        component:RegisterComponent
    },
    {
        path:'forget-password',
        component:ForgetPasswordComponent
    }
    ]
},
{path:'',component:MainLayoutComponent
    ,canActivate:[authGuard]
     ,children: [
    {
        path:'feed'
       , component:FeedComponent
    },
    {
        path:'profile',
        component:ProfileComponent
    },
    {
        path:'notifications',
        component:NotificationsComponent
    },
    {
        path:'change-password',
        component:ChangePasswordComponent
    }
    ]
},
{
        path:'**',
        component:NotFoundComponent
    }
];
