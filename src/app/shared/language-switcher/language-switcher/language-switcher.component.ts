import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html'
})
export class LanguageSwitcherComponent {

  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);

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

  toggleLanguage(): void {

    const language =
      this.currentLanguage() === 'en'
        ? 'ar'
        : 'en';

    this.changeLanguage(language);
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
}