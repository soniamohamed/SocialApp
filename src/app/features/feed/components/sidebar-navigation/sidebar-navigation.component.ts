import { Component } from '@angular/core';
import { RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-sidebar-navigation',
  imports: [RouterLinkActive],
  templateUrl: './sidebar-navigation.component.html',
  styleUrl: './sidebar-navigation.component.css',
})
export class SidebarNavigationComponent {}
