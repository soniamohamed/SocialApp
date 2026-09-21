import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';

import { PostsService } from '../../../../core/services/posts.service';
import { Post, PostsDataResponse } from '../../../../core/models/posts-data.interface';
import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import { PostCommentsComponent } from './components/post-comments/post-comments.component';
import { UserInfo } from '../../../../core/models/user-data.interface';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { ProfileService } from '../../../../core/services/profile.service';
import { BookmarksResponse } from '../../../../core/models/profile-data.interface';
import { CommunityComponent } from '../../../community/community.component';

@Component({
  selector: 'app-feed-content',

  imports: [
    ReactiveFormsModule,
    CommunityComponent,
    PostCommentsComponent,
    RouterLink,DatePipe
  ],

  templateUrl: './feed-content.component.html',
  styleUrl: './feed-content.component.css'
})
export class FeedContentComponent implements OnInit {

  private readonly profileService = inject(ProfileService);
  readonly source: string = inject(ActivatedRoute).snapshot.data['source'] ?? 'feed';
  isLoading = false;
  loadError = '';

  private readonly postsService = inject(PostsService);
  private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef);


  // ==========================================
  // File Input
  // ==========================================

  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;


  // ==========================================
  // Post الذي نريد الرجوع إليه
  // ==========================================

  targetPostId: string | null = null;


  // ==========================================
  // Posts
  // ==========================================

  postList: Post[] = [];

  readonly postLikeRequests = new Set<string>();
  readonly bookmarkRequests = new Set<string>();
  readonly bookmarkErrors = new Map<string, string>();
  readonly updateRequests = new Set<string>();
  readonly deleteRequests = new Set<string>();
  readonly postActionErrors = new Map<string, string>();
  editingPostId: string | null = null;
  deleteConfirmationPostId: string | null = null;
  readonly editBodyControl = new FormControl('', { nonNullable: true });
  readonly editPrivacyControl = new FormControl('public', { nonNullable: true });


  // ==========================================
  // User Data
  // ==========================================

  userId: string = '';

  userData: UserInfo = {} as UserInfo;


  // ==========================================
  // Selected File
  // ==========================================

  selectedFile: File | undefined;

  imgUrl: string | ArrayBuffer | null = null;

  selectedFileType: 'image' | 'video' | null = null;


  // ==========================================
  // Form Controls
  // ==========================================

  contentControle: FormControl = new FormControl('');

  privacyControle: FormControl = new FormControl('public');


  // ==========================================
  // On Init
  // ==========================================

  ngOnInit(): void {

    // Get Current User
    this.getUserData();


    // Get postId from Navigation State
    this.targetPostId = history.state?.postId ?? null;


    // Get All Posts
    this.getAllPosts();
  }


  // ==========================================
  // Scroll To Specific Post
  // ==========================================

  private scrollToPost(postId: string): void {

    const postElement = document.getElementById(
      `post-${postId}`
    );

    if (!postElement) {
      return;
    }

    postElement.scrollIntoView({
      behavior: 'auto',
      block: 'center'
    });
  }


  // ==========================================
  // Get All Posts
  // ==========================================

  getAllPosts(): void {

    if (this.source === 'community') return;

    this.isLoading = true;
    this.loadError = '';
    const request: Observable<PostsDataResponse | BookmarksResponse> = this.source === 'my-posts'
      ? this.profileService.GetMyPosts()
      : this.source === 'saved'
        ? this.profileService.GetBookmarks()
        : this.postsService.getAllPosts();

    request.pipe(finalize(() => this.isLoading = false)).subscribe({

      next: (res) => {

        if (!res.success) {
          return;
        }


        // Update Posts List
        this.postList = 'posts' in res.data ? res.data.posts : res.data.bookmarks;


        // Scroll To Post
        if (this.targetPostId) {

          const postId = this.targetPostId;

          // Use only once
          this.targetPostId = null;


          // Wait until Angular renders posts
          setTimeout(() => {

            this.scrollToPost(postId);

          }, 0);
        }

      },

      error: (err) => {

        this.loadError = 'Unable to load posts. Please try again.';
        console.error('Failed to load posts:',
          err
        );

      }

    });
  }


  // ==========================================
  // Get Current User Data
  // ==========================================

  getUserData(): void {

    const userData = localStorage.getItem('userData');

    if (!userData) {
      return;
    }

    try {

      this.userData = JSON.parse(userData);

      this.userId = this.userData._id;

    } catch (error) {

      console.error(
        'Invalid userData in localStorage:',
        error
      );

    }
  }


  // ==========================================
  // Change File
  // ==========================================

  ChangeFile(e: Event): void {

    const input = e.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }


    const file = input.files[0];

    this.selectedFile = file;


    // Determine file type
    if (file.type.startsWith('image/')) {

      this.selectedFileType = 'image';

      this.previewImg();

    } else if (file.type.startsWith('video/')) {

      this.selectedFileType = 'video';

      this.previewVideo();

    } else {

      this.selectedFile = undefined;

      this.selectedFileType = null;

      this.imgUrl = null;

      this.resetFileInput();

    }
  }


  // ==========================================
  // Preview Image
  // ==========================================

  previewImg(): void {

    if (!this.selectedFile) {
      return;
    }


    const fileReader = new FileReader();

    fileReader.readAsDataURL(
      this.selectedFile
    );


    fileReader.onload = () => {

      this.imgUrl = fileReader.result;

    };
  }


  // ==========================================
  // Preview Video
  // ==========================================

  previewVideo(): void {

    if (!this.selectedFile) {
      return;
    }


    const videoUrl = URL.createObjectURL(
      this.selectedFile
    );

    this.imgUrl = videoUrl;
  }


  // ==========================================
  // Remove File
  // ==========================================

  removeFile(): void {

    // Clear selected file
    this.selectedFile = undefined;


    // Clear preview
    this.imgUrl = null;


    // Clear type
    this.selectedFileType = null;


    // VERY IMPORTANT
    // Clear actual input value
    this.resetFileInput();
  }


  // ==========================================
  // Reset File Input
  // ==========================================

  private resetFileInput(): void {

    if (this.fileInput) {

      this.fileInput.nativeElement.value = '';

    }
  }


  // ==========================================
  // Create Post
  // ==========================================

  submitForm(
    e: SubmitEvent,
    formElement: HTMLFormElement
  ): void {

    // Prevent Page Reload
    e.preventDefault();


    // ==========================================
    // Create FormData
    // ==========================================

    const formdata = new FormData();


    // ==========================================
    // Post Body
    // ==========================================

    const body = this.contentControle.value?.trim();

    if (body) {

      formdata.append(
        'body',
        body
      );
    }


    // ==========================================
    // Privacy
    // ==========================================

    if (this.privacyControle.value) {

      formdata.append(
        'privacy',
        this.privacyControle.value
      );
    }


    // ==========================================
    // Image / Video
    // ==========================================

    if (this.selectedFile) {

      formdata.append(
        'image',
        this.selectedFile
      );
    }


    // ==========================================
    // Create Post API
    // ==========================================

    this.postsService.createPost(formdata).subscribe({

      next: (res) => {

        if (!res.success) {
          return;
        }


        // ==========================================
        // Create New Post Object
        // ==========================================

        const newPost: Post = {

          ...res.data.post,

          user: {

            _id: this.userData._id,

            name: this.userData.name,

            username: this.userData.username,

            photo: this.userData.photo

          },

          likesCount: 0,

          commentsCount: 0,

          sharesCount: 0,

          bookmarked: false

        };


        // ==========================================
        // Add New Post Immediately
        // ==========================================

        if (this.source === 'feed' || this.source === 'my-posts') {
          this.postList = [newPost, ...this.postList];
        }


        // ==========================================
        // Reset Form
        // ==========================================

        formElement.reset();

        this.contentControle.setValue('');

        this.privacyControle.setValue('public');


        // ==========================================
        // Reset File
        // ==========================================

        this.removeFile();

      },

      error: (err) => {

        console.error(
          'Create post failed:',
          err
        );

      }

    });
  }


  // ==========================================
  // Update Comments Count
  // ==========================================

  updateCommentsCount(
    postId: string,
    commentsCount: number
  ): void {

    this.postList = this.postList.map(
      post => {

        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          commentsCount
        };

      }
    );
  }


  // ==========================================
  // Delete Post
  // ==========================================

  confirmDeletePost(postId: string): void {
    if (this.deleteRequests.has(postId)) return;

    const post = this.postList.find((item) => item.id === postId);
    if (!post || post.user._id !== this.userId) return;

    this.deleteRequests.add(postId);
    this.postActionErrors.delete(postId);

    this.postsService.deletePost(postId)
      .pipe(finalize(() => this.deleteRequests.delete(postId)))
      .subscribe({

      next: (res) => {

        if (!res.success) {
          return;
        }


        // ==========================================
        // Remove Immediately From UI
        // ==========================================

        this.postList = this.postList.filter(
          post => post.id !== postId
        );
        this.deleteConfirmationPostId = null;
        if (this.editingPostId === postId) this.cancelEdit();

      },

      error: (error: HttpErrorResponse) => {
        this.postActionErrors.set(
          postId,
          error.error?.message || 'Unable to delete this post. Please try again.',
        );
      }

    });
  }

   UpdateLikeInPost( postId: string):void
    {
    if (this.postLikeRequests.has(postId)) {
      return;
    }

    const currentPost = this.postList.find(post => post.id === postId);

    if (!currentPost || !this.userId) {
      return;
    }

    const wasLiked = currentPost.likes.includes(this.userId);

    this.postLikeRequests.add(postId);

    this.postsService
      .LikeUnlikePost(
        postId
      )

      .pipe(
        finalize(() => {
          this.postLikeRequests.delete(postId);
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
              ? currentPost.likes.filter(userId => userId !== this.userId)
              : [...currentPost.likes, this.userId];

          const likesCount = typeof responsePost?.likesCount === 'number'
            ? Math.max(0, responsePost.likesCount)
            : Math.max(0, currentPost.likesCount + (wasLiked ? -1 : 1));

          this.postList = this.postList.map(post =>
            post.id === postId
              ? { ...post, likes, likesCount }
              : post
          );

        },

        error: (err) => {
          console.error('Post like request failed:', err);
        }

      });
    }

  isPostLiked(post: Post): boolean {
    return Boolean(this.userId) && post.likes.includes(this.userId);
  }

  isPostLikeLoading(postId: string): boolean {
    return this.postLikeRequests.has(postId);
  }

  toggleBookmark(postId: string, event?: Event): void {
    if (this.bookmarkRequests.has(postId)) return;

    this.closePostMenu(event);

    const currentPost = this.postList.find((post) => post.id === postId);
    if (!currentPost) return;

    const wasBookmarked = currentPost.bookmarked;
    this.bookmarkRequests.add(postId);
    this.bookmarkErrors.delete(postId);

    this.postsService.ToggleBookmark(postId)
      .pipe(finalize(() => this.bookmarkRequests.delete(postId)))
      .subscribe({
        next: (response) => {
          if (!response.success) return;

          const apiBookmarked = response.data?.post?.bookmarked;
          const bookmarked = typeof apiBookmarked === 'boolean'
            ? apiBookmarked
            : !wasBookmarked;

          this.postList = this.postList.map((post) =>
            post.id === postId ? { ...post, bookmarked } : post,
          );
        },
        error: (error: HttpErrorResponse) => {
          this.bookmarkErrors.set(
            postId,
            error.error?.message || 'Unable to update the saved post. Please try again.',
          );
        },
      });
  }

  startEdit(post: Post, event?: Event): void {
    this.closePostMenu(event);
    if (post.user._id !== this.userId) return;

    this.deleteConfirmationPostId = null;
    this.postActionErrors.delete(post.id);
    this.editingPostId = post.id;
    this.editBodyControl.setValue(post.body ?? '');
    this.editPrivacyControl.setValue(post.privacy);
  }

  cancelEdit(): void {
    this.editingPostId = null;
    this.editBodyControl.reset('');
    this.editPrivacyControl.reset('public');
  }

  updatePost(postId: string): void {
    if (this.updateRequests.has(postId)) return;

    const currentPost = this.postList.find((post) => post.id === postId);
    if (!currentPost || currentPost.user._id !== this.userId) return;

    const body = this.editBodyControl.value.trim();
    if (!body && !currentPost.image) {
      this.postActionErrors.set(postId, 'A post must contain text or media.');
      return;
    }

    this.updateRequests.add(postId);
    this.postActionErrors.delete(postId);
    const privacy = this.editPrivacyControl.value;

    this.postsService.updatePost(postId, { body, privacy })
      .pipe(finalize(() => this.updateRequests.delete(postId)))
      .subscribe({
        next: (response) => {
          if (!response.success) return;

          const updatedPost = response.data?.post;
          this.postList = this.postList.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  body: updatedPost?.body ?? body,
                  image: updatedPost?.image ?? post.image,
                  privacy: updatedPost?.privacy ?? privacy,
                }
              : post,
          );
          this.cancelEdit();
        },
        error: (error: HttpErrorResponse) => {
          this.postActionErrors.set(
            postId,
            error.error?.message || 'Unable to update this post. Please try again.',
          );
        },
      });
  }

  requestDelete(post: Post, event?: Event): void {
    this.closePostMenu(event);
    if (post.user._id !== this.userId) return;

    this.cancelEdit();
    this.postActionErrors.delete(post.id);
    this.deleteConfirmationPostId = post.id;
  }

  cancelDelete(): void {
    if (this.deleteConfirmationPostId && this.deleteRequests.has(this.deleteConfirmationPostId)) return;
    this.deleteConfirmationPostId = null;
  }

  private closePostMenu(event?: Event): void {
    const target = event?.currentTarget as HTMLElement | null;
    target?.closest('details')?.removeAttribute('open');
  }

  onPostMenuToggle(event: Event): void {
    const activeMenu = event.currentTarget as HTMLDetailsElement;
    if (!activeMenu.open) return;

    const menus = this.hostElement.nativeElement.querySelectorAll('details[open]') as NodeListOf<HTMLDetailsElement>;
    menus.forEach((menu) => {
      if (menu !== activeMenu) menu.removeAttribute('open');
    });
  }

}
