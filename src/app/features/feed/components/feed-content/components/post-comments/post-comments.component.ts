import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ElementRef
} from '@angular/core';

import {
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';

import { CommentsService } from './services/comments.service';

import { Comment } from './models/commentsData.interface';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';
import { PostRepliesComponent } from './components/post-replies/post-replies.component';


@Component({
  selector: 'app-post-comments',

  imports: [
    ReactiveFormsModule, DatePipe, PostRepliesComponent
  ],

  templateUrl: './post-comments.component.html',

  styleUrl: './post-comments.component.css'
})
export class PostCommentsComponent implements OnInit, OnChanges {

  private readonly commentsService =
    inject(CommentsService);


  // =========================================================
  // COMMENTS
  // =========================================================

  commentsList: Comment[] = [];

  readonly commentLikeRequests = new Set<string>();

  readonly expandedReplyCommentIds = new Set<string>();

  currentPage: number = 1;

  numberOfPages: number = 0;

  isLoadingMore: boolean = false;

  @Input({ required: true })
  postId: string = '';

  @Input({ required: true })
  commentsCount: number = 0;


  // =========================================================
  // COMMENTS COUNT OUTPUT
  // =========================================================

  @Output()
  commentsCountChange =
    new EventEmitter<number>();


  // =========================================================
  // CREATE COMMENT
  // =========================================================

  selectedFile: File | null = null;

  imgUrl: string | ArrayBuffer | null = null;

  contentControl: FormControl =
    new FormControl('');


  // =========================================================
  // EDIT COMMENT
  // =========================================================

  editingCommentId: string | null = null;

  editContentControl: FormControl =
    new FormControl('');

  editSelectedFile: File | null = null;

  editImgUrl: string | ArrayBuffer | null = null;


  // true = user clicked X
  // and wants to remove existing image
  removeEditImage: boolean = false;

  // ربط عنصر الـ input الخاص بالتعديل بـ ViewChild
  @ViewChild('editFileInput') editFileInputRef!: ElementRef<HTMLInputElement>;


  // =========================================================
  // USER
  // =========================================================

  userId: string = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.getUserId();

  }


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['postId'] && this.postId) {
      this.commentsList = [];
      this.currentPage = 1;
      this.numberOfPages = 0;
      this.isLoadingMore = false;
      this.getPostComments();
    }

  }


  // =========================================================
  // GET USER ID
  // =========================================================

  getUserId(): void {

    const userData =
      localStorage.getItem('userData');


    if (!userData) {
      return;
    }


    try {

      this.userId =
        JSON.parse(userData)?._id ?? '';

    } catch (error) {

      console.error(
        'Invalid userData:',
        error
      );

    }

  }


  // =========================================================
  // GET COMMENTS
  // =========================================================

  getPostComments(): void {

    this.commentsService
      .getPostComments(this.postId, 1)

      .subscribe({

        next: (res) => {

          if (!res.success) {
            return;
          }


          this.commentsList =
            res.data.comments;

          this.currentPage =
            res.meta.pagination.currentPage;

          this.numberOfPages =
            res.meta.pagination.numberOfPages;

        },


        error: (err) => {

          console.error(
            'Error loading comments:',
            err
          );

        }

      });

  }


  // =========================================================
  // LOAD MORE COMMENTS
  // =========================================================

  viewMoreComments(): void {

    if (
      this.isLoadingMore ||
      this.commentsList.length >= this.commentsCount
    ) {
      return;
    }

    const nextPage = this.currentPage + 1;

    this.isLoadingMore = true;

    this.commentsService
      .getPostComments(this.postId, nextPage)
      .pipe(
        finalize(() => {
          this.isLoadingMore = false;
        })
      )
      .subscribe({

        next: (res) => {

          if (!res.success) {
            return;
          }

          const loadedCommentIds = new Set(
            this.commentsList.map(comment => comment._id)
          );

          const newComments = res.data.comments.filter(
            comment => !loadedCommentIds.has(comment._id)
          );

          this.commentsList = [
            ...this.commentsList,
            ...newComments
          ];

          this.currentPage =
            res.meta.pagination.currentPage;

          this.numberOfPages =
            res.meta.pagination.numberOfPages;

        },

        error: (err) => {
          console.error(
            'Error loading more comments:',
            err
          );
        }

      });

  }


  // =========================================================
  // EMIT COMMENTS COUNT
  // =========================================================

  private emitCommentsCount(): void {

    this.commentsCountChange.emit(
      this.commentsCount
    );

  }


  // =========================================================
  // CREATE COMMENT - SELECT FILE
  // =========================================================

  ChangeFile(e: Event): void {

    const input =
      e.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    this.selectedFile =
      input.files[0];


    this.previewImg();

  }


  // =========================================================
  // CREATE IMAGE PREVIEW
  // =========================================================

  previewImg(): void {

    if (!this.selectedFile) {
      return;
    }


    const fileReader =
      new FileReader();


    fileReader.readAsDataURL(
      this.selectedFile
    );


    fileReader.onload = () => {

      this.imgUrl =
        fileReader.result;

    };

  }


  // =========================================================
  // REMOVE CREATE IMAGE
  // =========================================================

  removeFile(): void {

    this.imgUrl = null;

    this.selectedFile = null;


    const fileInput =
      document.getElementById(
        `commentFileInput-${this.postId}`
      ) as HTMLInputElement;


    if (fileInput) {

      fileInput.value = '';

    }

  }


  // =========================================================
  // SUBMIT CREATE COMMENT
  // =========================================================

  submitForm(
    e: SubmitEvent,
    formElement: HTMLFormElement
  ): void {

    e.preventDefault();


    const content =
      this.contentControl.value?.trim();


    // =======================================================
    // VALIDATION
    // =======================================================

    if (
      !content &&
      !this.selectedFile
    ) {

      return;

    }


    // =======================================================
    // FORM DATA
    // =======================================================

    const formdata =
      new FormData();


    // =======================================================
    // CONTENT
    // =======================================================

    if (content) {

      formdata.append(
        'content',
        content
      );

    }


    // =======================================================
    // IMAGE
    // =======================================================

    if (this.selectedFile) {

      formdata.append(
        'image',
        this.selectedFile
      );

    }


    // =======================================================
    // API
    // =======================================================

    this.commentsService
      .createComment(
        this.postId,
        formdata
      )

      .subscribe({

        next: (res) => {

          if (!res.success) {
            return;
          }


          const newComment =
            res.data.comment;


          // =================================================
          // ADD NEW COMMENT
          // =================================================

          this.commentsList = [
            newComment,
            ...this.commentsList
          ];

          this.commentsCount++;


          // =================================================
          // UPDATE PARENT COUNT
          // =================================================

          this.emitCommentsCount();


          // =================================================
          // RESET FORM
          // =================================================

          this.resetCreateForm(
            formElement
          );

        },


        error: (err) => {

          console.error(
            'Error creating comment:',
            err
          );

        }

      });

  }


  // =========================================================
  // RESET CREATE FORM
  // =========================================================

  resetCreateForm(
    formElement: HTMLFormElement
  ): void {

    formElement.reset();


    this.contentControl.reset('');


    this.imgUrl = null;


    this.selectedFile = null;


    const fileInput =
      document.getElementById(
        `commentFileInput-${this.postId}`
      ) as HTMLInputElement;


    if (fileInput) {

      fileInput.value = '';

    }

  }


  // =========================================================
  // START EDIT COMMENT
  // =========================================================

  startEdit(comment: Comment): void {

    // Save comment ID
    this.editingCommentId =
      comment._id;


    // Existing content
    this.editContentControl.setValue(
      comment.content
    );


    // No new image
    this.editSelectedFile = null;


    // Do not remove existing image
    this.removeEditImage = false;


    // Show existing image
    this.editImgUrl =
      comment.image ?? null;

  }


  // =========================================================
  // SELECT NEW IMAGE WHILE EDITING
  // =========================================================

  changeEditFile(e: Event): void {

    const input =
      e.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    // Save new file
    this.editSelectedFile =
      input.files[0];


    // New image means:
    // don't remove the image
    this.removeEditImage = false;


    // Preview
    const reader =
      new FileReader();


    reader.onload = () => {

      this.editImgUrl =
        reader.result;

    };


    reader.readAsDataURL(
      this.editSelectedFile
    );

  }


  // =========================================================
  // REMOVE EDIT IMAGE
  // =========================================================

  removeEditFile(): void {

    // Remove image from UI
    this.editImgUrl = null;


    // Remove newly selected file
    this.editSelectedFile = null;


    // Tell API to remove existing image
    this.removeEditImage = true;


    // تفريغ الـ input باستخدام الـ ViewChild لضمان الأمان وعدم حدوث خطأ
    if (this.editFileInputRef) {
      this.editFileInputRef.nativeElement.value = '';
    }

  }


  // =========================================================
  // UPDATE COMMENT
  // =========================================================

updateComment(
  commentId: string
): void {

  const content =
    this.editContentControl.value?.trim();

  // =======================================================
  // FORM DATA
  // =======================================================

  const formdata =
    new FormData();


  // =======================================================
  // CONTENT
  // =======================================================
  // بنبعث الـ content حتى لو فاضي (أو حسب رغبة الباك إند، بس يفضل لو متاح)
  if (content !== undefined && content !== null) {
    formdata.append(
      'content',
      content
    );
  }


  // =======================================================
  // NEW IMAGE (لو المستخدم اختار صورة جديدة)
  // =======================================================

  if (this.editSelectedFile) {

    formdata.append(
      'image',
      this.editSelectedFile
    );

  }

  // ملحوظة: تم إلغاء حقل removeImage نهائياً لأنه ممنوع من الباك إند


  // =======================================================
  // API
  // =======================================================

  this.commentsService
    .updateComment(
      this.postId,
      commentId,
      formdata
    )

    .subscribe({

      next: (res) => {

        if (!res.success) {
          return;
        }

        const updatedComment =
          res.data.comment;

        // =================================================
        // UPDATE COMMENT IN UI
        // =================================================

        this.commentsList =
          this.commentsList.map(
            comment =>
              comment._id === commentId
                ? updatedComment
                : comment
          );

        // =================================================
        // CLOSE EDIT
        // =================================================

        this.cancelEdit();

      },

      error: (err) => {

        console.error(
          'Error updating comment:',
          err
        );

      }

    });

}


  // =========================================================
  // CANCEL EDIT
  // =========================================================

  cancelEdit(): void {

    // Exit edit mode
    this.editingCommentId = null;


    // Clear content
    this.editContentControl.reset('');


    // Clear selected image
    this.editSelectedFile = null;


    // Clear preview
    this.editImgUrl = null;


    // Reset remove flag
    this.removeEditImage = false;

  }


  // =========================================================
  // DELETE COMMENT
  // =========================================================

  deleteComment(
    postId: string,
    commentId: string
  ): void {

    this.commentsService
      .deleteComment(
        postId,
        commentId
      )

      .subscribe({

        next: (res) => {

          if (!res.success) {
            return;
          }


          // =================================================
          // REMOVE COMMENT FROM UI
          // =================================================

          this.commentsList =
            this.commentsList.filter(
              comment =>
                comment._id !== commentId
            );

          this.commentsCount = Math.max(
            0,
            this.commentsCount - 1
          );


          // =================================================
          // UPDATE PARENT COUNT
          // =================================================

          this.emitCommentsCount();

        },


        error: (err) => {

          console.error(
            'Error deleting comment:',
            err
          );

        }

      });

    }
    UpdateLikeInComment( postId: string,commentId: string):void
    {
    if (this.commentLikeRequests.has(commentId)) {
      return;
    }

    const currentComment = this.commentsList.find(
      comment => comment._id === commentId
    );

    if (!currentComment || !this.userId) {
      return;
    }

    const wasLiked = currentComment.likes.includes(this.userId);

    this.commentLikeRequests.add(commentId);

    this.commentsService
      .likeUnlikeComment(
        postId,
        commentId
      )

      .pipe(
        finalize(() => {
          this.commentLikeRequests.delete(commentId);
        })
      )

      .subscribe({

        next: (res) => {

          if (!res.success) {
            return;
          }

          const responseComment = res.data?.comment;

          const likes = Array.isArray(responseComment?.likes)
            ? responseComment.likes
            : wasLiked
              ? currentComment.likes.filter(userId => userId !== this.userId)
              : [...currentComment.likes, this.userId];

          const likesCount = typeof responseComment?.likesCount === 'number'
            ? Math.max(0, responseComment.likesCount)
            : Array.isArray(responseComment?.likes)
              ? responseComment.likes.length
              : Math.max(
                  0,
                  (currentComment.likesCount ?? currentComment.likes.length) +
                    (wasLiked ? -1 : 1)
                );

          this.commentsList = this.commentsList.map(comment =>
            comment._id === commentId
              ? { ...comment, likes, likesCount }
              : comment
          );

        },

        error: (err) => {
          console.error('Comment like request failed:', err);
        }

      });
    }

  isCommentLiked(comment: Comment): boolean {
    return Boolean(this.userId) && comment.likes.includes(this.userId);
  }

  isCommentLikeLoading(commentId: string): boolean {
    return this.commentLikeRequests.has(commentId);
  }

  toggleReplies(commentId: string): void {
    if (this.expandedReplyCommentIds.has(commentId)) {
      this.expandedReplyCommentIds.delete(commentId);
      return;
    }

    this.expandedReplyCommentIds.add(commentId);
  }

  updateRepliesCount(commentId: string, repliesCount: number): void {
    this.commentsList = this.commentsList.map(comment =>
      comment._id === commentId
        ? { ...comment, repliesCount }
        : comment
    );
  }
}
