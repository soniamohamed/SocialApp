import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';

import { PostsService } from '../../../../core/services/posts.service';
import { Post } from '../../../../core/models/posts-data.interface';
import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import { PostCommentsComponent } from './components/post-comments/post-comments.component';
import { UserInfo } from '../../../../core/models/user-data.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-feed-content',

  imports: [
    ReactiveFormsModule,
    PostCommentsComponent,
    RouterLink
  ],

  templateUrl: './feed-content.component.html',
  styleUrl: './feed-content.component.css'
})
export class FeedContentComponent implements OnInit {

  private readonly postsService = inject(PostsService);


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

    this.postsService.getAllPosts().subscribe({

      next: (res) => {

        if (!res.success) {
          return;
        }


        // Update Posts List
        this.postList = res.data.posts;


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

        console.error(
          'Failed to load posts:',
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

        this.postList = [
          newPost,
          ...this.postList
        ];


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

  deletePost(postId: string): void {

    this.postsService.deletePost(postId).subscribe({

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

      },

      error: (err) => {

        console.error(
          'Delete post failed:',
          err
        );

      }

    });
  }

}