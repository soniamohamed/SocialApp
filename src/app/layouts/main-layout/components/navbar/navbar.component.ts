import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterLinkActive ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  // متغير للتحكم في ظهور أو إخفاء القائمة المنسدلة
  isDropdownOpen: boolean = false;
private readonly authService= inject(AuthService);
  // دالة تبديل الحالة عند النقر على زر البروفايل
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  // لما يختار حاجه من الdropdown وتروح للمسار يتقفل 
  closeDropdown() {
    this.isDropdownOpen =false;
  }
  // close dropdown when click outside
   @HostListener('document:click',['$event'])
    onDocumentClick(event:MouseEvent) :void
    {
       const target = event.target as HTMLElement;
       const clickInside=target.closest('.profile-dropdown');
       if(!clickInside)
       {
        this.closeDropdown();
       }
    }
  
  // دالة تسجيل الخروج
  logOut() {
    this.authService.signOut()
  }
}