import { Component } from '@angular/core';
import { SidebarNavigationComponent } from "./components/sidebar-navigation/sidebar-navigation.component";
import { FeedContentComponent } from "./components/feed-content/feed-content.component";
import { SuggestedFriendsComponent } from "./components/suggested-friends/suggested-friends.component";

@Component({
  selector: 'app-feed',
  imports: [SidebarNavigationComponent, FeedContentComponent, SuggestedFriendsComponent],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent {}
