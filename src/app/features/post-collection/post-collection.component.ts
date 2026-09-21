import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Post, PostsDataResponse } from '../../core/models/posts-data.interface';
import { BookmarksResponse } from '../../core/models/profile-data.interface';
import { ProfileService } from '../../core/services/profile.service';

type PostCollectionSource = 'my-posts' | 'saved';

@Component({
  selector: 'app-post-collection',
  imports: [DatePipe, RouterLink],
  templateUrl: './post-collection.component.html',
  styleUrl: './post-collection.component.css',
})
export class PostCollectionComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly route = inject(ActivatedRoute);

  source: PostCollectionSource = 'my-posts';
  posts: Post[] = [];
  isLoading = false;
  errorMessage = '';

  get title(): string {
    return this.source === 'my-posts' ? 'My Posts' : 'Saved Posts';
  }

  get emptyMessage(): string {
    return this.source === 'my-posts' ? 'No posts yet.' : 'No saved posts yet.';
  }

  ngOnInit(): void {
    const routeSource = this.route.snapshot.data['source'];
    this.source = routeSource === 'saved' ? 'saved' : 'my-posts';
    this.loadPosts();
  }

  loadPosts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const request: Observable<PostsDataResponse | BookmarksResponse> = this.source === 'my-posts'
      ? this.profileService.GetMyPosts()
      : this.profileService.GetBookmarks();

    request.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: (response) => {
        this.posts = 'posts' in response.data ? response.data.posts : response.data.bookmarks;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message || `Unable to load ${this.title.toLowerCase()}.`;
      },
    });
  }

  postId(post: Post): string {
    return post.id || post._id;
  }
}
