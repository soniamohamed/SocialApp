import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-sidebar-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-navigation.component.html',
  styleUrl: './sidebar-navigation.component.css',
})
export class SidebarNavigationComponent {}
