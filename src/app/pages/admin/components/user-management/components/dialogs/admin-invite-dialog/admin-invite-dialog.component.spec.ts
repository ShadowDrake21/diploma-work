import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInviteDialogComponent } from './admin-invite-dialog.component';

describe('AdminInviteDialogComponent', () => {
  let component: AdminInviteDialogComponent;
  let fixture: ComponentFixture<AdminInviteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminInviteDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminInviteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
