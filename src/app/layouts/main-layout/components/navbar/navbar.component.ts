import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  PLATFORM_ID
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { NotificationsService } from '../../../../core/services/notifications.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TranslatePipe
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  private readonly authService = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef);

  readonly currentUser = this.authService.currentUser;
  readonly unreadCount = this.notificationsService.unreadCount;

  readonly isDropdownOpen = signal(false);

  readonly currentLanguage = signal<'en' | 'ar'>('en');


  constructor() {

    if (isPlatformBrowser(this.platformId)) {

      const savedLanguage =
        (localStorage.getItem('language') as 'en' | 'ar') || 'en';

      this.changeLanguage(savedLanguage);

    } else {

      this.translate.use('en');

    }

  }


  changeLanguage(language: 'en' | 'ar'): void {

    this.currentLanguage.set(language);

    this.translate.use(language);

    if (isPlatformBrowser(this.platformId)) {

      localStorage.setItem('language', language);

      document.documentElement.lang = language;

      document.documentElement.dir =
        language === 'ar'
          ? 'rtl'
          : 'ltr';

    }

  }


  toggleLanguage(): void {

    const newLanguage =
      this.currentLanguage() === 'en'
        ? 'ar'
        : 'en';

    this.changeLanguage(newLanguage);

  }


  toggleDropdown(event: MouseEvent): void {

    event.stopPropagation();

    this.isDropdownOpen.update(
      value => !value
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