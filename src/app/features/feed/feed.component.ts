import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNavigationComponent } from "./components/sidebar-navigation/sidebar-navigation.component";
import { SuggestedFriendsComponent } from "./components/suggested-friends/suggested-friends.component";

@Component({
  selector: 'app-feed',
  imports: [RouterOutlet, SidebarNavigationComponent, SuggestedFriendsComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent {}
