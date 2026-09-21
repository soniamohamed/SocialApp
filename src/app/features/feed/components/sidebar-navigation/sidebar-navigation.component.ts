import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar-navigation',
  imports: [RouterLink, RouterLinkActive,TranslatePipe],
  templateUrl: './sidebar-navigation.component.html',
  styleUrl: './sidebar-navigation.component.css',
})
export class SidebarNavigationComponent {}
