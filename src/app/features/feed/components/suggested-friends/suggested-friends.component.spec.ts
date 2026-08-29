import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestedFriendsComponent } from './suggested-friends.component';

describe('SuggestedFriendsComponent', () => {
  let component: SuggestedFriendsComponent;
  let fixture: ComponentFixture<SuggestedFriendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestedFriendsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestedFriendsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
