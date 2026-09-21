import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Post } from '../../core/models/posts-data.interface';
import { ProfileUser } from '../../core/models/profile-data.interface';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, RouterLink,TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);

  profile: ProfileUser | null = null;
  myPosts: Post[] = [];
  savedPosts: Post[] = [];
  activeTab: 'posts' | 'saved' = 'posts';
  myPostsCount = 0;
  isLoading = false;
  errorMessage = '';

  get savedPostsCount(): number {
    return this.savedPosts.length;
  }

  get displayedPosts(): Post[] {
    return this.activeTab === 'posts' ? this.myPosts : this.savedPosts;
  }

  get displayedCount(): number {
    return this.activeTab === 'posts' ? this.myPostsCount : this.savedPostsCount;
  }

  get bookmarksCount(): number {
    return this.savedPostsCount;
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      profile: this.profileService.GetMyProfile(),
      posts: this.profileService.GetMyPosts(),
      bookmarks: this.profileService.GetBookmarks(),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ profile, posts, bookmarks }) => {
          this.profile = profile.data.user;
          this.myPosts = posts.data.posts;
          this.savedPosts = bookmarks.data.bookmarks;
          this.myPostsCount = posts.meta?.pagination?.total ?? this.myPosts.length;
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.message || 'Unable to load your profile. Please try again.';
        },
      });
  }

  setActiveTab(tab: 'posts' | 'saved'): void {
    this.activeTab = tab;
  }

  postId(post: Post): string {
    return post.id || post._id;
  }
}
