import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, map, Subscription } from 'rxjs';

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

  private readonly destroyRef = inject(DestroyRef);
  private searchQuery = '';
  private suggestionsRequest?: Subscription;

  readonly followRequests = new Set<string>();

  suggestions: SuggestedFriend[] = [];

  currentPage = 0;
  totalPages = 0;
  totalSuggestions = 0;

  isLoading = false;
  isLoadingMore = false;

  errorMessage = '';


  // ============================================
  // NORMALIZE SEARCH
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
  // SEARCH BY NAME OR USERNAME
  // Results come from the server for the active query
  // ============================================

  get filteredSuggestions(): SuggestedFriend[] {
    return this.suggestions;
  }


  // ============================================
  // INIT
  // ============================================

  ngOnInit(): void {
    this.loadPage(1);
    this.searchControl.valueChanges.pipe(
      map(value => this.normalizeSearchValue(value)),
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(query => {
      this.searchQuery = query;
      this.loadPage(1);
    });
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
  // LOAD 20 USERS PER PAGE
  // ============================================

  private loadPage(
    page: number,
    append = false
  ): void {

    if (append && (this.isLoading || this.isLoadingMore)) return;

    this.suggestionsRequest?.unsubscribe();
    if (!append) {
      this.suggestions = [];
      this.currentPage = 0;
      this.totalPages = 0;
      this.totalSuggestions = 0;
    }

    if (append) {
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
    }

    this.errorMessage = '';

    this.suggestionsRequest = this.suggestedFriendsService
      .GetFollowSuggestions(page, 20, this.searchQuery)

      .pipe(
        takeUntilDestroyed(this.destroyRef),
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

          // Remove duplicate users
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