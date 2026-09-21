import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, ElementRef, input, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../core/auth/services/auth.service';
import { Post } from '../core/models/posts-data.interface';
import { DetailsComponent } from './details/details.component';
import { FeedContentComponent } from './feed/components/feed-content/feed-content.component';
import { PostCommentsComponent } from './feed/components/feed-content/components/post-comments/post-comments.component';

@Component({ selector: 'app-post-comments', template: '' })
class CommentsStub {
  postId = input('');
  commentsCount = input(0);
  commentsCountChange = output<number>();
}

const original: Post = {
  _id: 'post-1', id: 'post-1', body: 'Original text', image: 'original.jpg', privacy: 'only_me',
  user: { _id: 'owner', name: 'Owner', username: 'owner', photo: '' },
  likes: ['reader'], likesCount: 1, commentsCount: 2, sharesCount: 3,
  isShare: false, bookmarked: true, createdAt: '2026-09-21',
};

describe('Edit Post', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    vi.spyOn(FeedContentComponent.prototype, 'ngOnInit').mockImplementation(() => {});
    vi.spyOn(DetailsComponent.prototype, 'ngOnInit').mockImplementation(() => {});
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        provideRouter([]),
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
        { provide: AuthService, useValue: { currentUser: () => ({ _id: 'owner' }) } },
      ],
    });
    for (const componentType of [FeedContentComponent, DetailsComponent]) {
      TestBed.overrideComponent(componentType, {
        remove: { imports: [PostCommentsComponent] },
        add: { imports: [CommentsStub] },
      });
    }
    await TestBed.compileComponents();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    try {
      http.verify();
    } finally {
      TestBed.resetTestingModule();
      vi.restoreAllMocks();
    }
  });

  function setup(feed: boolean) {
    const component = TestBed.runInInjectionContext(() => feed
      ? new FeedContentComponent()
      : new DetailsComponent());
    component.userId = 'owner';
    const other = { ...original, _id: 'post-2', id: 'post-2', body: 'Other text' };
    if (component instanceof FeedContentComponent) component.postList = [{ ...original }, other];
    else component.postData = { ...original, body: original.body!, image: original.image!, sharedPost: '', topComment: '' };
    const menu = document.createElement('details');
    menu.open = true;
    const button = document.createElement('button');
    menu.append(button);
    button.addEventListener('click', event => {
      if (component instanceof FeedContentComponent) component.startEdit(component.postList[0], event);
      else component.startEdit(event);
    });
    return {
      component, other,
      start: () => {
        if (component instanceof DetailsComponent) component.isMenuOpen = true;
        button.click();
      },
      update: () => component instanceof FeedContentComponent ? component.updatePost('post-1') : component.updatePost(),
      post: () => component instanceof FeedContentComponent ? component.postList[0] : component.postData,
      editing: () => component instanceof FeedContentComponent ? component.editingPostId === 'post-1' : component.isEditing,
      loading: () => component instanceof FeedContentComponent ? component.updateRequests.has('post-1') : component.isUpdating,
      error: () => component instanceof FeedContentComponent ? component.postActionErrors.get('post-1') : component.actionMessage,
      menuOpen: () => component instanceof FeedContentComponent ? menu.open : component.isMenuOpen,
    };
  }

  for (const feed of [true, false]) {
    const label = feed ? 'Feed' : 'Details';

    it(`${label}: submitting the rendered edit form prevents navigation and sends one request`, async () => {
      await TestBed.compileComponents();
      const fixture = feed ? TestBed.createComponent(FeedContentComponent) : TestBed.createComponent(DetailsComponent);
      const component = fixture.componentInstance;
      component.userId = 'owner';
      if (component instanceof FeedContentComponent) {
        component.postList = [{ ...original }];
        component.startEdit(component.postList[0]);
      } else {
        component.postData = { ...original, body: original.body!, image: original.image!, sharedPost: '', topComment: '' };
        component.startEdit(new MouseEvent('click'));
      }
      fixture.detectChanges();
      const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector(feed ? '#edit-body-post-1' : '#details-edit-body');
      textarea.value = '  Submitted from textarea  ';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
      const form = textarea.closest('form')!;
      const submit = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submit);
      expect(submit.defaultPrevented).toBe(true);
      fixture.detectChanges();
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
      expect(button.disabled).toBe(true);
      expect(button.textContent?.trim()).toBe('Updating...');
      const request = http.expectOne(req => req.method === 'PUT');
      expect(request.request.body).toEqual({ body: 'Submitted from textarea' });
      request.flush({ success: true, message: 'Updated', data: { post: { body: 'Persisted body' } } });
      // This isolated test uses zoneless change detection; the app uses Zone.js.
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Persisted body');
      expect(fixture.nativeElement.querySelector(feed ? '#edit-body-post-1' : '#details-edit-body')).toBeNull();
    });

    it(`${label}: sends one body-only JSON PUT and uses the returned body without changing other fields`, () => {
      const editor = setup(feed);
      editor.start();
      expect(editor.menuOpen()).toBe(false);
      expect(editor.component.editBodyControl.value).toBe(original.body);
      const before = editor.post();
      editor.component.editBodyControl.setValue('  Edited text  ');
      editor.update();
      editor.update();
      expect(editor.loading()).toBe(true);
      const req = http.expectOne(request => request.url.endsWith('/posts/post-1'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ body: 'Edited text' });
      expect(req.request.detectContentTypeHeader()).toBe('application/json');
      req.flush({ success: true, message: 'Updated', data: { post: {
        body: 'Server-confirmed text', image: 'ignored.jpg', privacy: 'public', user: 'owner', likesCount: 999,
      } } });
      expect(editor.post()).toEqual({ ...before, body: 'Server-confirmed text' });
      expect(editor.editing()).toBe(false);
      expect(editor.loading()).toBe(false);
      if (editor.component instanceof FeedContentComponent) expect(editor.component.postList[1]).toBe(editor.other);
      expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    });

    for (const data of [undefined, {}, { post: {} }]) {
      it(`${label}: falls back to submitted body when the response has no updated body (${JSON.stringify(data)})`, () => {
        const editor = setup(feed);
        editor.start();
        editor.component.editBodyControl.setValue('  Edited text  ');
        editor.update();
        http.expectOne(request => request.method === 'PUT').flush({ success: true, message: 'Updated', data });
        expect(editor.post().body).toBe('Edited text');
        expect(editor.editing()).toBe(false);
      });
    }

    it(`${label}: rejects empty text even for an image post and cancels without a request`, () => {
      const editor = setup(feed);
      editor.start();
      editor.component.editBodyControl.setValue('   ');
      editor.update();
      expect(editor.error()).toBe('Post text cannot be empty.');
      expect(editor.editing()).toBe(true);
      editor.component.editBodyControl.setValue('Unsaved draft');
      editor.component.cancelEdit();
      expect(editor.editing()).toBe(false);
      expect(editor.post().body).toBe(original.body);
      expect(editor.component.editBodyControl.value).toBe(original.body);
      http.expectNone(() => true);
    });

    it(`${label}: prevents editing another user's post`, () => {
      const editor = setup(feed);
      editor.component.userId = 'someone-else';
      editor.start();
      editor.component.editBodyControl.setValue('Not allowed');
      editor.update();
      expect(editor.editing()).toBe(false);
      http.expectNone(() => true);
    });

    for (const httpError of [true, false]) {
      it(`${label}: retains the draft and displays ${httpError ? 'HTTP' : 'success:false'} errors`, () => {
        const editor = setup(feed);
        editor.start();
        editor.component.editBodyControl.setValue('My draft');
        editor.update();
        const request = http.expectOne(req => req.method === 'PUT');
        const response = { success: false, message: 'Update rejected' };
        if (httpError) request.flush(response, { status: 400, statusText: 'Bad Request' });
        else request.flush(response);
        expect(editor.error()).toBe('Update rejected');
        expect(editor.component.editBodyControl.value).toBe('My draft');
        expect(editor.post().body).toBe(original.body);
        expect(editor.editing()).toBe(true);
        expect(editor.loading()).toBe(false);
        editor.update();
        http.expectOne(req => req.method === 'PUT').flush({ success: true, message: 'Updated' });
        expect(editor.post().body).toBe('My draft');
      });
    }
  }
});
