import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRoleChipComponent } from './user-role-chip.component';

describe('UserRoleChipComponent', () => {
  let component: UserRoleChipComponent;
  let fixture: ComponentFixture<UserRoleChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRoleChipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRoleChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
