import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { MyCommentsComponent } from './my-comments.component';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommentService } from '@core/services/comment.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { of } from 'rxjs';
import { UserRole } from '@shared/enums/user.enum';

describe('MyCommentsComponent', () => {
  let component: MyCommentsComponent;
  let fixture: ComponentFixture<MyCommentsComponent>;
  let mockCommentService: jasmine.SpyObj<CommentService>;

  const mockCommentsResponse = {
    success: true,
    data: [
      {
        id: '1',
        content: 'Test comment',
        createdAt: new Date().toISOString(),
        likes: 5,
        projectTitle: 'Test Project',
        projectId: '123',
      },
    ],
    page: 0,
    totalPages: 1,
    totalItems: 1,
    hasNext: false,
    timestamp: new Date().toISOString(),
  };

  beforeEach(async () => {
    mockCommentService = jasmine.createSpyObj('CommentService', [
      'getCommentsByUserId',
    ]);

    currentUserSig.set({
      id: 1,
      username: 'User',
      email: 'user@example.com',
      role: UserRole.USER,
      affiliation: 'University',
      publicationCount: 0,
      patentCount: 0,
      researchCount: 0,
      tags: [],
      active: true,
    });

    await TestBed.configureTestingModule({
      imports: [MatPaginatorModule, MatCardModule],
      providers: [{ provide: CommentService, useValue: mockCommentService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MyCommentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pageSize()).toBe(10);
    expect(component.pageIndex()).toBe(0);
    expect(component.comments().data).toEqual([]);
  });

  it('should load comments on init', fakeAsync(() => {
    mockCommentService.getCommentsByUserId.and.returnValue(
      of(mockCommentsResponse)
    );
    fixture.detectChanges(); // Triggers ngOnInit

    tick(); // Wait for async operations

    expect(mockCommentService.getCommentsByUserId).toHaveBeenCalledWith(
      1,
      0,
      10
    );
    expect(component.comments().data?.length).toBe(1);
  }));

  it('should handle page change', fakeAsync(() => {
    mockCommentService.getCommentsByUserId.and.returnValue(
      of(mockCommentsResponse)
    );
    const pageEvent: PageEvent = { pageIndex: 1, pageSize: 5, length: 10 };

    component.onPageChange(pageEvent);
    tick();

    expect(component.pageIndex()).toBe(1);
    expect(component.pageSize()).toBe(5);
    expect(mockCommentService.getCommentsByUserId).toHaveBeenCalledWith(
      1,
      1,
      5
    );
  }));

  it('should display no comments message when empty', () => {
    mockCommentService.getCommentsByUserId.and.returnValue(
      of({
        ...mockCommentsResponse,
        data: [],
        totalItems: 0,
      })
    );

    fixture.detectChanges();

    const noCommentsMsg = fixture.nativeElement.querySelector('p');
    expect(noCommentsMsg.textContent).toContain(
      'Ви ще не опублікували жодного коментаря'
    );
  });

  it('should display comments when available', fakeAsync(() => {
    mockCommentService.getCommentsByUserId.and.returnValue(
      of(mockCommentsResponse)
    );
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const commentCards = fixture.nativeElement.querySelectorAll('mat-card');
    expect(commentCards.length).toBe(1);

    const commentContent = commentCards[0].querySelector('p').textContent;
    expect(commentContent).toContain('Test comment');
  }));
});
