import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { SuggestedFriend } from '../../../../core/models/suggested-friends-data.interface';
import { SuggestedFriendsService } from '../../../../core/services/suggested-friends.service';

@Component({
  selector: 'app-suggested-friends',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './suggested-friends.component.html',
  styleUrl: './suggested-friends.component.css',
})
export class SuggestedFriendsComponent implements OnInit {

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
  errorMessage = '';



  // ============================================
  // FILTER SUGGESTIONS
  // Search by name OR username
  // Feed displays maximum 5 users
  // ============================================

  get filteredSuggestions(): SuggestedFriend[] {

    const query = this.searchControl.value
      .trim()
      .toLowerCase()
      .replace(/^@/, '');

    // No search => show first 5 users only
    if (!query) {
      return this.suggestions.slice(0, 5);
    }

    return this.suggestions
      .filter((friend) => {

        const name = (friend.name ?? '')
          .trim()
          .toLowerCase();

        const username = (friend.username ?? '')
          .trim()
          .toLowerCase()
          .replace(/^@/, '');

        return (
          name.includes(query) ||
          username.includes(query)
        );

      })
      .slice(0, 5);
  }



  // ============================================
  // CHECK IF MORE PAGES EXIST
  // ============================================

  get hasMore(): boolean {
    return this.currentPage < this.totalPages;
  }



  // ============================================
  // INIT
  // ============================================

  ngOnInit(): void {
    this.loadSuggestions(1);
  }



  // ============================================
  // FOLLOW USER
  // ============================================

  follow(friend: SuggestedFriend): void {

    if (this.followRequests.has(friend._id)) {
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

          // Remove followed user from suggestions
          this.suggestions =
            this.suggestions.filter(
              (item) => item._id !== friend._id
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
  // LOAD SUGGESTIONS
  // API loads 20
  // UI displays only first 5
  // ============================================

  private loadSuggestions(page: number): void {

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    this.errorMessage = '';

    this.suggestedFriendsService
      .GetFollowSuggestions(page, 20)

      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )

      .subscribe({

        next: (response) => {

          const currentUserId =
            this.authService.currentUser()?._id;

          // Remove current logged-in user
          const incoming =
            response.data.suggestions.filter(
              (friend) =>
                friend._id !== currentUserId
            );

          // Remove duplicates
          this.suggestions = Array.from(
            new Map(
              incoming.map(
                (friend) => [
                  friend._id,
                  friend
                ]
              )
            ).values()
          );

          // Pagination
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