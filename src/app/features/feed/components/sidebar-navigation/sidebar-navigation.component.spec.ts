import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarNavigationComponent } from './sidebar-navigation.component';

describe('SidebarNavigationComponent', () => {
  let component: SidebarNavigationComponent;
  let fixture: ComponentFixture<SidebarNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNavigationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarNavigationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
