import { Component, OnInit, inject } from '@angular/core';
import { PostsService } from '../../core/services/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from './models/post-details-data.interface';
import { PostCommentsComponent } from '../feed/components/feed-content/components/post-comments/post-comments.component';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [PostCommentsComponent],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  postId: string = '';
  userId: string = '';

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
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        this.userId = JSON.parse(userData)?._id || '';
      } catch (e) {
        this.userId = '';
      }
    }
  }


goBack(): void {

  this.router.navigate(['/feed'], {

    state: {
      postId: this.postId
    }

  });

}

}