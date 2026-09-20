import { Component, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { filter } from 'rxjs';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App  {
  protected readonly title = signal('SocialApp');
constructor(private router: Router) {}
  ngOnInit(): void {
    // تشغيل التهيئة عند فتح التطبيق أول مرة
    initFlowbite();
    // إعادة التهيئة مع كل تنقل بين الصفحات في الـ CSR
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      setTimeout(() => {
        initFlowbite();
      }, 50);
    });
  }


}
