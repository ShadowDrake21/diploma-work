import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsTableComponent } from './comments-table.component';

describe('CommentsTableComponent', () => {
  let component: CommentsTableComponent;
  let fixture: ComponentFixture<CommentsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
