import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentProjectDialogComponent } from './recent-project-dialog.component';

describe('RecentProjectDialogComponent', () => {
  let component: RecentProjectDialogComponent;
  let fixture: ComponentFixture<RecentProjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentProjectDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
