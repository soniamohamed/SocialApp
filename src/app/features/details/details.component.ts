import { Component, HostListener, OnInit, inject } from '@angular/core';
import { PostsService } from '../../core/services/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from './models/post-details-data.interface';
import { PostCommentsComponent } from '../feed/components/feed-content/components/post-comments/post-comments.component';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [PostCommentsComponent,DatePipe,ReactiveFormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  postId: string = '';
  userId: string = '';
  isPostLikeLoading: boolean = false;
  isMenuOpen = false;
  isEditing = false;
  isUpdating = false;
  isDeleteConfirmationOpen = false;
  isDeleting = false;
  isBookmarking = false;
  actionMessage = '';
  actionMessageType: 'success' | 'error' | '' = '';
  readonly editBodyControl = new FormControl('', { nonNullable: true });

  postData: Post = {
    _id: '',
    body: '',
    image: '',
    privacy: 'public',
    user: { _id: '', name: '', username: '', photo: '' },
    sharedPost: '',
    likes: [],
    createdAt: '',
    commentsCount: 0,
    topComment: '',
    sharesCount: 0,
    likesCount: 0,
    isShare: false,
    id: '',
    bookmarked: false
  };

  ngOnInit(): void {
    this.getUserId();
    this.getPostId();
  }

  getPostId() {
    this.activatedRoute.paramMap.subscribe((param) => {
      this.postId = param.get('id')!;
      if (this.postId) {
        this.getSinglePost();
      }
    });
  }

  getSinglePost(): void {
    this.postsService.getSinglePost(this.postId).subscribe({
      next: (res) => {
        if (res.success) {
          this.postData = res.data.post;
        }
      }
    });
  }

  getUserId(): void {
    this.userId = this.authService.currentUser()?._id ?? '';
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
  }

  keepMenuOpen(event: MouseEvent): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.isMenuOpen = false;
  }

  startEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.closeMenu();
    if (!this.userId || this.postData.user._id !== this.userId || this.isUpdating) return;

    this.isDeleteConfirmationOpen = false;
    this.actionMessage = '';
    this.actionMessageType = '';
    this.editBodyControl.setValue(this.postData.body ?? '');
    this.isEditing = true;
  }

  cancelEdit(): void {
    if (this.isUpdating) return;
    this.editBodyControl.setValue(this.postData.body ?? '');
    this.isEditing = false;
  }

  updatePost(): void {
    if (!this.isEditing || this.isUpdating || !this.userId || this.postData.user._id !== this.userId) return;

    const body = this.editBodyControl.value.trim();
    if (!body) {
      this.showActionMessage('Post text cannot be empty.', 'error');
      return;
    }

    this.isUpdating = true;
    this.actionMessage = '';
    this.actionMessageType = '';
    const postId = this.postData._id || this.postData.id;
    this.postsService.updatePost(postId, body)
      .pipe(finalize(() => (this.isUpdating = false)))
      .subscribe({
        next: (response) => {
          if ((this.postData._id || this.postData.id) !== postId) return;
          this.postData = {
            ...this.postData,
            body: response.body,
          };
          this.isEditing = false;
          this.showActionMessage(response.message || 'Post updated successfully.', 'success');
        },
        error: (error: HttpErrorResponse | Error) => {
          this.showActionMessage(
            (error instanceof HttpErrorResponse ? error.error?.message : error.message)
              || 'Unable to update this post. Please try again.', 'error');
        },
      });
  }

  requestDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.closeMenu();
    if (this.postData.user._id !== this.userId) return;

    this.isEditing = false;
    this.actionMessage = '';
    this.actionMessageType = '';
    this.isDeleteConfirmationOpen = true;
  }

  cancelDelete(): void {
    if (!this.isDeleting) this.isDeleteConfirmationOpen = false;
  }

  confirmDelete(): void {
    if (this.isDeleting || this.postData.user._id !== this.userId) return;

    this.isDeleting = true;
    this.postsService.deletePost(this.postData.id)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: (response) => {
          if (!response.success) return;
          this.isDeleteConfirmationOpen = false;
          this.router.navigate(['/feed']);
        },
        error: (error: HttpErrorResponse) => {
          this.showActionMessage(error.error?.message || 'Unable to delete this post. Please try again.', 'error');
        },
      });
  }

  toggleBookmark(event: MouseEvent): void {
    event.stopPropagation();
    this.closeMenu();
    if (this.isBookmarking) return;

    const wasBookmarked = this.postData.bookmarked;
    this.isBookmarking = true;
    this.postsService.ToggleBookmark(this.postData.id)
      .pipe(finalize(() => (this.isBookmarking = false)))
      .subscribe({
        next: (response) => {
          if (!response.success) return;
          const apiState = response.data?.post?.bookmarked;
          this.postData = {
            ...this.postData,
            bookmarked: typeof apiState === 'boolean' ? apiState : !wasBookmarked,
          };
        },
        error: (error: HttpErrorResponse) => {
          this.showActionMessage(error.error?.message || 'Unable to update the saved post.', 'error');
        },
      });
  }

  private showActionMessage(message: string, type: 'success' | 'error'): void {
    this.actionMessage = message;
    this.actionMessageType = type;
  }

  updateLike(): void {
    if (this.isPostLikeLoading || !this.postData.id || !this.userId) {
      return;
    }

    const wasLiked = this.postData.likes.includes(this.userId);
    const currentLikes = this.postData.likes;
    const currentLikesCount = this.postData.likesCount;

    this.isPostLikeLoading = true;

    this.postsService
      .LikeUnlikePost(this.postData.id)
      .pipe(
        finalize(() => {
          this.isPostLikeLoading = false;
        })
      )
      .subscribe({
        next: (res) => {
          if (!res.success) {
            return;
          }

          const responsePost = res.data?.post;

          const likes = Array.isArray(responsePost?.likes)
            ? responsePost.likes
            : wasLiked
              ? currentLikes.filter(userId => userId !== this.userId)
              : [...currentLikes, this.userId];

          const likesCount = typeof responsePost?.likesCount === 'number'
            ? Math.max(0, responsePost.likesCount)
            : Math.max(0, currentLikesCount + (wasLiked ? -1 : 1));

          this.postData = {
            ...this.postData,
            likes,
            likesCount
          };
        },
        error: (err) => {
          console.error('Post like request failed:', err);
        }
      });
  }

  isPostLiked(): boolean {
    return Boolean(this.userId) && this.postData.likes.includes(this.userId);
  }


goBack(): void {

  this.router.navigate(['/feed'], {

    state: {
      postId: this.postId
    }

  });

}

}
