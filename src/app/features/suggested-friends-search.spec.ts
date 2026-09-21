import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../core/auth/services/auth.service';
import { headersInterceptor } from '../core/interceptors/headers/headers-interceptor';
import { SuggestedFriend } from '../core/models/suggested-friends-data.interface';
import { SuggestedFriendsComponent } from './feed/components/suggested-friends/suggested-friends.component';
import { SuggestedFriendsPageComponent } from './suggested-friends-page/suggested-friends-page.component';

const users = (prefix: string, count: number): SuggestedFriend[] =>
  Array.from({ length: count }, (_, index) => ({
    _id: `${prefix}-${index}`, name: `${prefix} ${index}`, username: `${prefix}${index}`, photo: '',
  }));

const response = (key: 'users' | 'suggestions', results: SuggestedFriend[], page = 1) => ({
  success: true, message: 'success', data: { [key]: results },
  meta: { pagination: { currentPage: page, numberOfPages: 3, limit: 20, total: 60, nextPage: page + 1 } },
});

describe('Suggested Friends server search', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.setItem('socialToken', 'test-search-token');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([headersInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { currentUser: () => ({ _id: 'self' }) } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify({ ignoreCancelled: true });
    TestBed.resetTestingModule();
    localStorage.removeItem('socialToken');
    vi.useRealTimers();
  });

  function request(endpoint: 'search' | 'suggestions', page: number, query?: string) {
    const pending = http.expectOne(req => req.url.endsWith(`/users/${endpoint}`));
    expect(pending.request.method).toBe('GET');
    expect(pending.request.body).toBeNull();
    expect(pending.request.headers.get('Authorization')).toBe('Bearer test-search-token');
    expect(pending.request.params.get('page')).toBe(String(page));
    expect(pending.request.params.get('limit')).toBe('20');
    expect(pending.request.params.get('q')).toBe(query ?? null);
    return pending;
  }

  for (const sidebar of [true, false]) {
    const label = sidebar ? 'Feed sidebar' : 'full page';
    const create = () => TestBed.runInInjectionContext(() => sidebar
      ? new SuggestedFriendsComponent()
      : new SuggestedFriendsPageComponent());

    it(`${label}: debounces normalized search, skips duplicates and uses server results`, () => {
      const component = create();
      component.ngOnInit();
      request('suggestions', 1).flush(response('suggestions', users('initial', 20)));
      expect(component.filteredSuggestions.length).toBe(sidebar ? 5 : 20);

      component.searchControl.setValue('fa');
      vi.advanceTimersByTime(200);
      component.searchControl.setValue(' @FATEN ');
      vi.advanceTimersByTime(399);
      http.expectNone(req => req.url.endsWith('/users/search'));
      vi.advanceTimersByTime(1);
      request('search', 1, 'faten').flush(response('users', users('server-match', 20)));
      expect(component.filteredSuggestions.length).toBe(sidebar ? 5 : 20);
      expect(component.filteredSuggestions[0]._id).toBe('server-match-0');

      component.searchControl.setValue('faten');
      vi.advanceTimersByTime(400);
      http.expectNone(req => req.url.endsWith('/users/search'));
    });

    it(`${label}: cancels stale requests and restores suggestions when cleared`, () => {
      const component = create();
      component.ngOnInit();
      const initial = request('suggestions', 1);
      component.searchControl.setValue('faten');
      vi.advanceTimersByTime(400);
      expect(initial.cancelled).toBe(true);
      const search = request('search', 1, 'faten');
      component.searchControl.setValue('  ');
      vi.advanceTimersByTime(400);
      expect(search.cancelled).toBe(true);
      request('suggestions', 1).flush(response('suggestions', users('restored', 20)));
      expect(component.filteredSuggestions[0]._id).toBe('restored-0');
      expect(component.isLoading).toBe(false);
    });

    it(`${label}: recovers from search errors and cancels on destruction`, () => {
      const component = create();
      component.ngOnInit();
      request('suggestions', 1).flush(response('suggestions', []));
      component.searchControl.setValue('faten');
      vi.advanceTimersByTime(400);
      request('search', 1, 'faten').flush({ message: 'Search unavailable' }, { status: 500, statusText: 'Error' });
      expect(component.errorMessage).toBe('Search unavailable');
      expect(component.isLoading).toBe(false);
      component.searchControl.setValue('menna');
      vi.advanceTimersByTime(400);
      const pending = request('search', 1, 'menna');
      expect(component.errorMessage).toBe('');
      TestBed.resetTestingModule();
      expect(pending.cancelled).toBe(true);
    });
  }

  it('full page: appends 20-result search pages and resets when the query changes', () => {
    const component = TestBed.runInInjectionContext(() => new SuggestedFriendsPageComponent());
    component.ngOnInit();
    request('suggestions', 1).flush(response('suggestions', []));
    component.searchControl.setValue('faten');
    vi.advanceTimersByTime(400);
    request('search', 1, 'faten').flush(response('users', users('page1', 20)));
    component.loadMore();
    request('search', 2, 'faten').flush(response('users', users('page2', 20), 2));
    expect(component.filteredSuggestions.length).toBe(40);
    component.loadMore();
    const oldPage = request('search', 3, 'faten');
    component.searchControl.setValue('@gbng');
    vi.advanceTimersByTime(400);
    expect(oldPage.cancelled).toBe(true);
    expect(component.filteredSuggestions).toEqual([]);
    request('search', 1, 'gbng').flush(response('users', users('new-query', 1)));
    expect(component.currentPage).toBe(1);
    expect(component.filteredSuggestions.length).toBe(1);
    expect(component.isLoadingMore).toBe(false);
  });
});
