import { TestBed } from '@angular/core/testing';

import { SuggestedFriendsService } from './suggested-friends.service';

describe('SuggestedFriendsService', () => {
  let service: SuggestedFriendsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuggestedFriendsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
