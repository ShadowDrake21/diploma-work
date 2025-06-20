import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import { ProjectDetailsComponent } from './details.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { HeaderService } from '@core/services/header.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectAttachmentService } from '@core/services/project/project-details/attachments/project-attachment.service';
import { ProjectCommentService } from '@core/services/project/project-details/comments/project-comment.service';
import { ProjectDetailsService } from '@core/services/project/project-details/project-details.service';
import { ProjectTagService } from '@core/services/project/project-details/tags/project-tag.service';
import { ProjectDTO } from '@models/project.model';
import { of, throwError } from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';

describe('ProjectDetailsComponent', () => {
  let component: ProjectDetailsComponent;
  let fixture: ComponentFixture<ProjectDetailsComponent>;
  let mockProjectDetailsService: jasmine.SpyObj<ProjectDetailsService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockHeaderService: jasmine.SpyObj<HeaderService>;
  let mockProjectCommentService: jasmine.SpyObj<ProjectCommentService>;
  let mockProjectAttachmentService: jasmine.SpyObj<ProjectAttachmentService>;
  let mockProjectTagService: jasmine.SpyObj<ProjectTagService>;

  const mockProject: ProjectDTO = {
    id: '123',
    title: 'Test Project',
    description: 'Test Description',
    type: ProjectType.RESEARCH,
    progress: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1,
    tagIds: ['tag1', 'tag2'],
  };

  beforeEach(async () => {
    mockProjectDetailsService = jasmine.createSpyObj('ProjectDetailsService', [
      'loadProjectDetails',
      'deleteProject',
      'resetState',
      'project$',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showError',
      'showSuccess',
    ]);
    mockHeaderService = jasmine.createSpyObj('HeaderService', ['setTitle']);
    mockProjectCommentService = jasmine.createSpyObj('ProjectCommentService', [
      'refreshComments',
    ]);
    mockProjectAttachmentService = jasmine.createSpyObj(
      'ProjectAttachmentService',
      ['loadAttachments']
    );
    mockProjectTagService = jasmine.createSpyObj('ProjectTagService', [
      'loadTags',
    ]);

    mockActivatedRoute = {
      snapshot: {
        params: { id: '123' },
      },
    };

    mockAuthService.getCurrentUserId.and.returnValue('user1');
    mockProjectDetailsService.project$ = of(mockProject);
    mockProjectDetailsService.loadProjectDetails.and.returnValue();

    await TestBed.configureTestingModule({
      imports: [
        ProjectDetailsComponent,
        MatProgressBarModule,
        MatButtonModule,
        MatIconModule,
      ],
      providers: [
        { provide: ProjectDetailsService, useValue: mockProjectDetailsService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: HeaderService, useValue: mockHeaderService },
        { provide: ProjectCommentService, useValue: mockProjectCommentService },
        {
          provide: ProjectAttachmentService,
          useValue: mockProjectAttachmentService,
        },
        { provide: ProjectTagService, useValue: mockProjectTagService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with project ID from route', () => {
    fixture.detectChanges();
    expect(component.workId()).toBe('123');
  });

  it('should load project details on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(mockProjectDetailsService.loadProjectDetails).toHaveBeenCalledWith(
      '123'
    );
    expect(component.project()).toEqual(mockProject);
    expect(component.projectLoading()).toBeFalse();
    expect(mockHeaderService.setTitle).toHaveBeenCalled();
  }));

  it('should set isCurrentUserOwner correctly', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(component.isCurrentUserOwner()).toBeTrue();

    // Test when user is not owner
    mockAuthService.getCurrentUserId.and.returnValue('user2');
    mockProjectDetailsService.project$ = of(mockProject);
    fixture.detectChanges();
    tick();

    expect(component.isCurrentUserOwner()).toBeFalse();
  }));

  it('should load project dependencies', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(mockProjectCommentService.refreshComments).toHaveBeenCalledWith(
      '123'
    );
    expect(mockProjectTagService.loadTags).toHaveBeenCalledWith([
      'tag1',
      'tag2',
    ]);
    expect(mockProjectAttachmentService.loadAttachments).toHaveBeenCalledWith(
      ProjectType.RESEARCH,
      '123'
    );
  }));

  it('should handle project load error', fakeAsync(() => {
    mockProjectDetailsService.project$ = throwError(() => ({ status: 404 }));
    fixture.detectChanges();
    tick();

    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Проєкт не знайдено'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects/list']);
  }));

  it('should handle 403 error', fakeAsync(() => {
    mockProjectDetailsService.project$ = throwError(() => ({ status: 403 }));
    fixture.detectChanges();
    tick();

    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'У вас немає дозволу на перегляд цього проєкту'
    );
  }));

  it('should navigate to edit page', () => {
    component.onEdit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['../create'], {
      relativeTo: mockActivatedRoute,
      queryParams: { id: '123' },
    });
  });

  it('should open delete confirmation dialog', () => {
    mockDialog.open.and.returnValue({ afterClosed: () => of(false) } as any);
    component.onDelete();

    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should delete project when confirmed', fakeAsync(() => {
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
    mockProjectDetailsService.deleteProject.and.returnValue(of(undefined));

    component.onDelete();
    tick();

    expect(mockProjectDetailsService.deleteProject).toHaveBeenCalledWith('123');
    expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
      'Проєкт успішно видалено'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects/list']);
  }));

  it('should handle delete error', fakeAsync(() => {
    mockDialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
    mockProjectDetailsService.deleteProject.and.returnValue(
      throwError(() => ({ status: 403 }))
    );

    component.onDelete();
    tick();

    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'У вас немає дозволу на видалення цього проєкту'
    );
  }));

  it('should navigate back to list', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects/list']);
  });

  it('should reset state and unsubscribe on destroy', () => {
    const unsubscribeSpy = spyOn(component.subscriptions[0], 'unsubscribe');

    fixture.detectChanges();
    component.ngOnDestroy();

    expect(mockProjectDetailsService.resetState).toHaveBeenCalled();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should handle missing project ID', () => {
    mockActivatedRoute.snapshot.params = {};
    fixture = TestBed.createComponent(ProjectDetailsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    expect(mockNotificationService.showError).toHaveBeenCalledWith(
      'Недійсний ідентифікатор проекту'
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/projects/list']);
  });
});
