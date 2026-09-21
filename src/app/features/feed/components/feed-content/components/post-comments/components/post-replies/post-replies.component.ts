import { isPlatformBrowser } from '@angular/common';
import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { RepliesService } from '../../../CommentReplies/services/replies.service';
import { Comment } from '../../models/commentsData.interface';

@Component({
  selector: 'app-post-replies',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './post-replies.component.html',
  styleUrl: './post-replies.component.css'
})
export class PostRepliesComponent implements OnChanges {
  private readonly repliesService = inject(RepliesService);
  private readonly platformId = inject(PLATFORM_ID);

  @Input({ required: true }) postId: string = '';
  @Input({ required: true }) commentId: string = '';
  @Input({ required: true }) repliesCount: number = 0;

  @Output() repliesCountChange = new EventEmitter<number>();

  repliesList: Comment[] = [];
  replyControl = new FormControl('', { nonNullable: true });
  currentPage: number = 1;
  isLoading: boolean = false;
  isLoadingMore: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  userId: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['postId'] || changes['commentId']) &&
      this.postId &&
      this.commentId
    ) {
      this.readUserId();
      this.repliesList = [];
      this.currentPage = 1;
      this.loadReplies(1, false);
    }
  }

  loadMoreReplies(): void {
    if (
      this.isLoadingMore ||
      this.repliesList.length >= this.repliesCount
    ) {
      return;
    }

    this.loadReplies(this.currentPage + 1, true);
  }

  submitReply(): void {
    const content = this.replyControl.value.trim();

    if (!content || this.isSubmitting) {
      return;
    }

    const formData = new FormData();
    formData.append('content', content);

    this.isSubmitting = true;
    this.errorMessage = '';

    this.repliesService
      .CreateReply(this.postId, this.commentId, formData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (res) => {
          if (!res.success) {
            return;
          }

          const newReply = res.data.reply ?? res.data.comment;

          if (!newReply) {
            return;
          }

          this.repliesList = [newReply, ...this.repliesList];
          this.repliesCount++;
          this.repliesCountChange.emit(this.repliesCount);
          this.replyControl.reset('');
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Unable to add reply.';
        }
      });
  }

  private loadReplies(page: number, append: boolean): void {
    if (append) {
      this.isLoadingMore = true;
    } else {
      this.isLoading = true;
    }

    this.errorMessage = '';

    this.repliesService
      .GetCommentReplies(this.postId, this.commentId, page, 10)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.isLoadingMore = false;
        })
      )
      .subscribe({
        next: (res) => {
          if (!res.success) {
            return;
          }

          if (append) {
            const loadedIds = new Set(
              this.repliesList.map(reply => reply._id)
            );
            const newReplies = res.data.replies.filter(
              reply => !loadedIds.has(reply._id)
            );
            this.repliesList = [...this.repliesList, ...newReplies];
          } else {
            this.repliesList = res.data.replies;
          }

          this.currentPage = res.meta.pagination.currentPage;

          const apiRepliesCount = res.meta.pagination.total;

          if (typeof apiRepliesCount === 'number') {
            this.repliesCount = Math.max(0, apiRepliesCount);
            this.repliesCountChange.emit(this.repliesCount);
          }
        },
        error: (err) => {
          this.errorMessage = err?.error?.message ?? 'Unable to load replies.';
        }
      });
  }

  private readUserId(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const userData = localStorage.getItem('userData');

    if (!userData) {
      return;
    }

    try {
      this.userId = JSON.parse(userData)?._id ?? '';
    } catch {
      this.userId = '';
    }
  }
}
