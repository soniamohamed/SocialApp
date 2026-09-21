import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, map, Subscription } from 'rxjs';

import { AuthService } from '../../../../core/auth/services/auth.service';
import { SuggestedFriend } from '../../../../core/models/suggested-friends-data.interface';
import { SuggestedFriendsService } from '../../../../core/services/suggested-friends.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-suggested-friends',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,TranslatePipe
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

  private readonly destroyRef = inject(DestroyRef);
  private searchQuery = '';
  private suggestionsRequest?: Subscription;

  readonly followRequests = new Set<string>();

  suggestions: SuggestedFriend[] = [];

  currentPage = 0;
  totalPages = 0;
  totalSuggestions = 0;

  isLoading = false;
  errorMessage = '';

  private normalizeSearchValue(
    value: string | null | undefined
  ): string {
    return (value ?? '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '');
  }

  get filteredSuggestions(): SuggestedFriend[] {
    return this.suggestions.slice(0, 5);
  }

  get hasMore(): boolean {
    return this.currentPage < this.totalPages;
  }

  ngOnInit(): void {
    this.loadSuggestions(1);
    this.searchControl.valueChanges.pipe(
      map(value => this.normalizeSearchValue(value)),
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(query => {
      this.searchQuery = query;
      this.loadSuggestions(1);
    });
  }

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

  private loadSuggestions(page: number): void {

    this.suggestionsRequest?.unsubscribe();
    this.suggestions = [];
    this.currentPage = 0;
    this.totalPages = 0;
    this.totalSuggestions = 0;

    this.isLoading = true;
    this.errorMessage = '';

    this.suggestionsRequest = this.suggestedFriendsService
      .GetFollowSuggestions(page, 20, this.searchQuery)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading = false;
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