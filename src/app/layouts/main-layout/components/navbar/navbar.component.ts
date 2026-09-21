import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { NotificationsService } from '../../../../core/services/notifications.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  readonly isDropdownOpen = signal(false);

  private readonly authService = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly elementRef = inject(ElementRef);

  readonly currentUser = this.authService.currentUser;

  // نفس الكونت المستخدم في Notifications
  readonly unreadCount = this.notificationsService.unreadCount;


  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();

    this.isDropdownOpen.update(
      isOpen => !isOpen
    );
  }


  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const target = event.target as HTMLElement;

    const clickInside =
      this.elementRef.nativeElement.contains(target);

    if (!clickInside) {
      this.closeDropdown();
    }
  }


  logOut(): void {
    this.closeDropdown();
    this.authService.signOut();
  }
}