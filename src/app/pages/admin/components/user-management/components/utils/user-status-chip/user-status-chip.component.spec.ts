import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStatusChipComponent } from './user-status-chip.component';

describe('UserStatusChipComponent', () => {
  let component: UserStatusChipComponent;
  let fixture: ComponentFixture<UserStatusChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStatusChipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserStatusChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
