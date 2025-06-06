import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedRecentUsersBaseComponent } from './shared-recent-users-base.component';

describe('SharedRecentUsersBaseComponent', () => {
  let component: SharedRecentUsersBaseComponent;
  let fixture: ComponentFixture<SharedRecentUsersBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedRecentUsersBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedRecentUsersBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
