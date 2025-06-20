import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentComponent } from './comment.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '@core/authentication/auth.service';
import { IComment } from '@models/comment.types';
import { of } from 'rxjs';
import { UserRole } from '@shared/enums/user.enum';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  const mockComment: IComment = {
    id: '1',
    content: 'Test comment',
    userId: 1,
    userName: 'Test User',
    userAvatarUrl: 'test.jpg',
    createdAt: new Date().toISOString(),
    likes: 5,
    likedByCurrentUser: false,
    updatedAt: new Date().toISOString(),
    projectId: '1',
    projectTitle: 'title',
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUser$: of({ userId: 'user2' }),
    });

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue({
      afterClosed: () => of(true),
    });

    await TestBed.configureTestingModule({
      imports: [CommentComponent, MatDialogModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('comment', mockComment);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize signals correctly', () => {
    expect(component.isEditing()).toBeFalse();
    expect(component.isLiking()).toBeFalse();
    expect(component.editedContent()).toBe('');
  });

  describe('isCurrentUserComment', () => {
    it('should return false when comment is not from current user', () => {
      expect(component.isCurrentUserComment()).toBeFalse();
    });

    it('should return true when comment is from current user', () => {
      mockAuthService.currentUser$ = of({
        userId: 1,
        sub: 'user1',
        iat: 0,
        exp: 0,
        role: UserRole.USER,
      });
      fixture = TestBed.createComponent(CommentComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('comment', mockComment);
      fixture.detectChanges();

      expect(component.isCurrentUserComment()).toBeTrue();
    });
  });

  describe('onReply', () => {
    it('should emit the comment id', () => {
      spyOn(component.reply, 'emit');
      component.onReply();
      expect(component.reply.emit).toHaveBeenCalledWith('1');
    });
  });

  describe('onLikeToggle', () => {
    it('should not emit when isCurrentUserComment is true', () => {
      mockAuthService.currentUser$ = of({
        userId: 1,
        sub: 'user1',
        iat: 0,
        exp: 0,
        role: UserRole.USER,
      });
      fixture = TestBed.createComponent(CommentComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('comment', mockComment);
      fixture.detectChanges();

      spyOn(component.like, 'emit');
      component.onLikeToggle();
      expect(component.like.emit).not.toHaveBeenCalled();
    });

    it('should emit like action when comment is not liked', () => {
      spyOn(component.like, 'emit');
      component.onLikeToggle();
      expect(component.like.emit).toHaveBeenCalledWith(['like', '1']);
      expect(component.isLiking()).toBeTrue();
    });

    it('should emit unlike action when comment is liked', () => {
      fixture.componentRef.setInput('comment', {
        ...mockComment,
        likedByCurrentUser: true,
      });
      spyOn(component.like, 'emit');
      component.onLikeToggle();
      expect(component.like.emit).toHaveBeenCalledWith(['unlike', '1']);
    });

    it('should not emit when already liking', () => {
      component.isLiking.set(true);
      spyOn(component.like, 'emit');
      component.onLikeToggle();
      expect(component.like.emit).not.toHaveBeenCalled();
    });
  });

  describe('onEdit', () => {
    it('should set isEditing to true and set editedContent', () => {
      component.onEdit();
      expect(component.isEditing()).toBeTrue();
      expect(component.editedContent()).toBe('Test comment');
    });
  });

  describe('onSave', () => {
    it('should emit edit event and reset editing state', () => {
      component.isEditing.set(true);
      component.editedContent.set('Updated content');
      spyOn(component.edit, 'emit');

      component.onSave();

      expect(component.edit.emit).toHaveBeenCalledWith({
        id: '1',
        content: 'Updated content',
      });
      expect(component.isEditing()).toBeFalse();
    });
  });

  describe('onCancel', () => {
    it('should reset editing state', () => {
      component.isEditing.set(true);
      component.onCancel();
      expect(component.isEditing()).toBeFalse();
    });
  });

  describe('onDelete', () => {
    it('should open dialog and emit delete if confirmed', () => {
      spyOn(component.delete, 'emit');
      component.onDelete();

      expect(mockDialog.open).toHaveBeenCalled();
      expect(component.delete.emit).toHaveBeenCalledWith('1');
    });
  });
});
