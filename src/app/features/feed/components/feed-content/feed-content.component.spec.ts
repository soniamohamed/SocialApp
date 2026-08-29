import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedContentComponent } from './feed-content.component';

describe('FeedContentComponent', () => {
  let component: FeedContentComponent;
  let fixture: ComponentFixture<FeedContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedContentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
