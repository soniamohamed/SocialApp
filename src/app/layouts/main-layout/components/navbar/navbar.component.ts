import { Component, inject,HostListener,ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { initFlowbite } from 'flowbite';



@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterLinkActive  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  // متغير للتحكم في ظهور أو إخفاء القائمة المنسدلة
  isDropdownOpen: boolean = false;
private readonly authService= inject(AuthService);
 private elementRef = inject(ElementRef);

 
  ngOnInit(): void 
  {
     initFlowbite();
  }



 // دالة تبديل الحالة عند النقر على زر البروفايل
  toggleDropdown(event: MouseEvent): void {
  event.stopPropagation();

  this.isDropdownOpen = !this.isDropdownOpen;

  console.log('TOGGLE CLICK');
  console.log('isDropdownOpen =', this.isDropdownOpen);
}
  
  // لما يختار حاجه من الdropdown وتروح للمسار يتقفل 
  closeDropdown() {
    this.isDropdownOpen =false;
  }
  // // close dropdown when click outside
   @HostListener('document:click',['$event'])
    onDocumentClick(event:MouseEvent) :void
    {
       const target = event.target as HTMLElement;
       const clickInside= this.elementRef.nativeElement.contains(target);
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