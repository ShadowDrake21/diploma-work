import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentDeleteDialogueComponent } from './comment-delete-dialogue.component';

describe('CommentDeleteDialogueComponent', () => {
  let component: CommentDeleteDialogueComponent;
  let fixture: ComponentFixture<CommentDeleteDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentDeleteDialogueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentDeleteDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
