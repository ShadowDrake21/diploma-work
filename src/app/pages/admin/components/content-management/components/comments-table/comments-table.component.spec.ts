import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsTableComponent } from './comments-table.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { AdminService } from '@core/services/admin.service';
import { NotificationService } from '@core/services/notification.service';
import { IComment } from '@models/comment.types';
import { ConfirmDialogComponent } from '@pages/admin/components/user-management/components/dialogs/confirm-dialog/confirm-dialog.component';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MockProvider } from 'ng-mocks';
import { of, throwError } from 'rxjs';

describe('CommentsTableComponent', () => {
  let component: CommentsTableComponent;
  let fixture: ComponentFixture<CommentsTableComponent>;
  let adminService: AdminService;
  let notificationService: NotificationService;
  let dialog: MatDialog;
  let breakpointObserver: BreakpointObserver;

  const mockComments: IComment[] = [
    {
      id: '1',
      content: 'Test comment 1',
      userAvatarUrl: 'http://example.com/avatar1.jpg',
      userName: 'User 1',
      projectTitle: 'Project 1',
      likes: 5,
      createdAt: '2023-01-01T00:00:00Z',
      replies: [],
      updatedAt: new Date().toISOString(),
      projectId: '1',
      likedByCurrentUser: false,
      userId: 0,
    },
    {
      id: '2',
      content: 'Test comment 2',
      userAvatarUrl: 'http://example.com/avatar2.jpg',
      userName: 'User 2',
      projectTitle: 'Project 2',
      likes: 10,
      createdAt: '2023-01-02T00:00:00Z',
      replies: [
        {
          id: '3',
          content: 'Reply 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          likes: 0,
          projectId: '2',
          projectTitle: 'Project 2',
          likedByCurrentUser: false,
          userId: 2,
          userName: 'user',
          userAvatarUrl: null,
        },
      ],
      updatedAt: new Date().toISOString(),
      projectId: '2',
      likedByCurrentUser: false,
      userId: 0,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        CommentsTableComponent,
        TruncateTextPipe,
        LoaderComponent,
      ],
      providers: [
        {
          provide: AdminService,
          useValue: {
            loadAllComments: () => of({ data: mockComments, totalItems: 2 }),
            deleteComment: () => of({}),
          },
        },
        MockProvider(NotificationService),
        MockProvider(MatDialog, {
          open: jasmine
            .createSpy('open')
            .and.returnValue({ afterClosed: () => of(true) }),
        }),
        MockProvider(BreakpointObserver, {
          observe: () =>
            of({
              matches: false,
              breakpoints: { '(max-width: 800px)': false },
            }),
        }),
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsTableComponent);
    component = fixture.componentInstance;

    adminService = TestBed.inject(AdminService);
    notificationService = TestBed.inject(NotificationService);
    dialog = TestBed.inject(MatDialog);
    breakpointObserver = TestBed.inject(BreakpointObserver);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load comments on init', () => {
    spyOn(adminService, 'loadAllComments').and.callThrough();
    component.ngOnInit();
    expect(adminService.loadAllComments).toHaveBeenCalledWith(0, 10);
    expect(component.comments()).toEqual(mockComments);
    expect(component.totalItems()).toBe(2);
  });

  it('should handle page change', () => {
    spyOn(adminService, 'loadAllComments').and.callThrough();
    const pageEvent = { pageIndex: 1, pageSize: 20 } as PageEvent;
    component.onPageChange(pageEvent);

    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(20);
    expect(adminService.loadAllComments).toHaveBeenCalledWith(1, 20);
  });

  it('should open delete confirmation dialog', () => {
    spyOn(dialog, 'open').and.callThrough();
    component.deleteComment('1');
    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      data: {
        title: 'Видалити коментар',
        message: 'Ви впевнені, що хочете видалити цей коментар?',
        confirmText: 'Видалити',
        cancelText: 'Скасувати',
      },
    });
  });

  it('should delete comment when confirmed', () => {
    spyOn(adminService, 'deleteComment').and.callThrough();
    spyOn(notificationService, 'showSuccess');
    spyOn(component, 'loadComments');

    component.executeDeleteComment('1');

    expect(adminService.deleteComment).toHaveBeenCalledWith('1');
    expect(notificationService.showSuccess).toHaveBeenCalledWith(
      'Коментар успішно видалено'
    );
    expect(component.loadComments).toHaveBeenCalled();
  });

  it('should handle error when loading comments fails', () => {
    const errorResponse = new HttpErrorResponse({ status: 500 });
    spyOn(adminService, 'loadAllComments').and.returnValue(
      throwError(() => errorResponse)
    );
    spyOn(notificationService, 'showError');

    component.loadComments();

    expect(component.error()).toBe('Не вдалося завантажити коментарі');
    expect(notificationService.showError).toHaveBeenCalledWith(
      'Не вдалося завантажити коментарі'
    );
  });

  it('should handle different error statuses', () => {
    const testCases = [
      {
        status: 403,
        expectedMessage: 'У вас немає дозволу на виконання цієї дії',
      },
      { status: 404, expectedMessage: 'Коментар не знайдено' },
      {
        status: 409,
        expectedMessage: 'Неможливо видалити коментар із відповідями',
      },
      { status: 500, expectedMessage: 'Test error' },
    ];

    testCases.forEach(({ status, expectedMessage }) => {
      const errorResponse = new HttpErrorResponse({
        status,
        error: { message: status === 500 ? 'Test error' : undefined },
      });

      component.handleError(errorResponse, 'Default error');
      expect(component.error()).toBe(expectedMessage);
    });
  });

  it('should refresh comments', () => {
    spyOn(component, 'loadComments');
    component.refreshComments();
    expect(component.currentPage()).toBe(0);
    expect(component.loadComments).toHaveBeenCalled();
  });

  it('should handle mobile view detection', () => {
    spyOn(breakpointObserver, 'observe').and.callThrough();
    component.ngOnInit();
    expect(breakpointObserver.observe).toHaveBeenCalledWith([
      '(max-width: 800px)',
    ]);
    expect(component.isMobile()).toBeFalse();
  });
});
