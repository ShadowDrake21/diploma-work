import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentDeleteDialogueComponent } from './comment-delete-dialogue.component';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MatDialogModule,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

describe('CommentDeleteDialogueComponent', () => {
  let component: CommentDeleteDialogueComponent;
  let fixture: ComponentFixture<CommentDeleteDialogueComponent>;
  let dialogRefSpy: jasmine.SpyObj<
    MatDialogRef<CommentDeleteDialogueComponent>
  >;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatDialogModule,
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatDialogTitle,
        CommentDeleteDialogueComponent,
      ],
      providers: [{ provide: MatDialogRef, useValue: dialogRefSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentDeleteDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with false when "No" button is clicked', () => {
    const noButton = fixture.nativeElement.querySelector(
      'button[mat-dialog-close="false"]'
    );
    noButton.click();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true when "Yes" button is clicked', () => {
    const yesButton = fixture.nativeElement.querySelector(
      'button[mat-dialog-close="true"]'
    );
    yesButton.click();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });
});
