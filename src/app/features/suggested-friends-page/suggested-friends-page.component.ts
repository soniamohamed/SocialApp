import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/services/auth.service';
import { SuggestedFriend } from '../../core/models/suggested-friends-data.interface';
import { SuggestedFriendsService } from '../../core/services/suggested-friends.service';

@Component({
  selector: 'app-suggested-friends-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './suggested-friends-page.component.html',
  styleUrl: './suggested-friends-page.component.css',
})
export class SuggestedFriendsPageComponent implements OnInit {

  private readonly suggestedFriendsService =
    inject(SuggestedFriendsService);

  private readonly authService =
    inject(AuthService);

  readonly searchControl = new FormControl('', {
    nonNullable: true
  });

  readonly followRequests = new Set<string>();

  suggestions: SuggestedFriend[] = [];

  currentPage = 0;
  totalPages = 0;
  totalSuggestions = 0;

  isLoading = false;
  isLoadingMore = false;

  errorMessage = '';


  // ============================================
  // SEARCH BY NAME OR USERNAME
  // ============================================

  get filteredSuggestions(): SuggestedFriend[] {

    const query = this.normalizeSearchValue(
      this.searchControl.value
    );

    if (!query) {
      return this.suggestions;
    }

    return this.suggestions.filter((friend) => {

      const name =
        this.normalizeSearchValue(friend.name);

      const username =
        this.normalizeSearchValue(friend.username);

      return (
        name.includes(query) ||
        username.includes(query)
      );
    });
  }


  // ============================================
  // NORMALIZE SEARCH TEXT
  // ============================================

  private normalizeSearchValue(
    value: string | null | undefined
  ): string {

    return (value ?? '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '');
  }


  // ============================================
  // INIT
  // ============================================

  ngOnInit(): void {
    this.loadPage(1);
  }


  // ============================================
  // HAS MORE
  // ============================================

  get hasMore(): boolean {
    return this.currentPage < this.totalPages;
  }


  // ============================================
  // LOAD MORE
  // ============================================

  loadMore(): void {

    if (
      !this.hasMore ||
      this.isLoading ||
      this.isLoadingMore
    ) {
      return;
    }

    this.loadPage(
      this.currentPage + 1,
      true
    );
  }


  // ============================================
  // FOLLOW USER
  // ============================================

  follow(friend: SuggestedFriend): void {

    if (
      this.followRequests.has(friend._id)
    ) {
      return;
    }

    this.followRequests.add(friend._id);

    this.errorMessage = '';

    this.suggestedFriendsService
      .FollowUnfollowUser(friend._id)

      .pipe(
        finalize(() => {
          this.followRequests.delete(friend._id);
        })
      )

      .subscribe({

        next: (response) => {

          if (!response.success) {
            return;
          }

          this.suggestions =
            this.suggestions.filter(
              (item) =>
                item._id !== friend._id
            );

          this.totalSuggestions =
            Math.max(
              0,
              this.totalSuggestions - 1
            );
        },

        error: (error: HttpErrorResponse) => {

          this.errorMessage =
            error.error?.message ||
            'Unable to follow this user. Please try again.';
        }

      });
  }


  // ============================================
  // LOAD PAGE
  // 20 USERS EACH PAGE
  // ============================================

  private loadPage(
    page: number,
    append = false
  ): void {

    if (
      this.isLoading ||
      this.isLoadingMore
    ) {
      return;
    }

    if (append) {
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
    }

    this.errorMessage = '';

    this.suggestedFriendsService
      .GetFollowSuggestions(page, 20)

      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.isLoadingMore = false;
        })
      )

      .subscribe({

        next: (response) => {

          const currentUserId =
            this.authService.currentUser()?._id;

          const incoming =
            response.data.suggestions.filter(
              (friend) =>
                friend._id !== currentUserId
            );

          const combined =
            append
              ? [
                  ...this.suggestions,
                  ...incoming
                ]
              : incoming;

          // remove duplicate users
          this.suggestions = Array.from(
            new Map(
              combined.map(
                (friend) => [
                  friend._id,
                  friend
                ]
              )
            ).values()
          );

          this.currentPage =
            response.meta.pagination.currentPage;

          this.totalPages =
            response.meta.pagination.numberOfPages;

          this.totalSuggestions =
            response.meta.pagination.total;
        },

        error: (error: HttpErrorResponse) => {

          this.errorMessage =
            error.error?.message ||
            'Unable to load suggested friends.';
        }

      });
  }

}