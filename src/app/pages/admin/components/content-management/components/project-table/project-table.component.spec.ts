import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTableComponent } from './project-table.component';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttachmentsService } from '@core/services/attachments.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectDTO } from '@models/project.model';
import { FileSizePipe } from '@pipes/file-size.pipe';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MockModule, MockComponent } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { ProjectEditModalComponent } from './components/project-edit-modal/project-edit-modal.component';
import { ProjectProgressColorPipe } from './pipes/project-progress-color.pipe';
import { ProjectTypeNamePipe } from './pipes/project-type-name.pipe';
import { ProjectType } from '@shared/enums/categories.enum';

describe('ProjectTableComponent', () => {
  let component: ProjectTableComponent;
  let fixture: ComponentFixture<ProjectTableComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockAttachmentsService: jasmine.SpyObj<AttachmentsService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockProjectFormService: jasmine.SpyObj<ProjectFormService>;

  const mockProjects: ProjectDTO[] = [
    {
      id: '1',
      title: 'Test Project 1',
      type: ProjectType.RESEARCH,
      description: 'Test description 1',
      progress: 50,
      createdAt: new Date().toISOString(),
      createdBy: 1,
      tagIds: [],
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Test Project 2',
      type: ProjectType.PUBLICATION,
      description: 'Test description 2',
      progress: 80,
      createdAt: new Date().toISOString(),
      createdBy: 2,
      tagIds: [],
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockAttachments: FileMetadataDTO[] = [
    {
      id: '1',
      fileName: 'test.pdf',
      fileSize: 1024,
      fileUrl: 'http://example.com/test.pdf',
      entityType: ProjectType.PUBLICATION,
      entityId: '1',
      uploadedAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'getAllProjects',
      'deleteProject',
    ]);
    mockAttachmentsService = jasmine.createSpyObj('AttachmentsService', [
      'getFilesByEntity',
    ]);
    mockNotificationService = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
    ]);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockProjectFormService = jasmine.createSpyObj('ProjectFormService', [
      'submitForm',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        MockModule(MatTableModule),
        MockModule(MatPaginatorModule),
        MockModule(MatButtonModule),
        MockModule(MatIconModule),
        MockModule(MatMenuModule),
        MockModule(MatTooltipModule),
        MockModule(MatProgressBarModule),
        MockModule(MatChipsModule),
        MockModule(MatListModule),
      ],
      declarations: [
        ProjectTableComponent,
        MockComponent(ProjectEditModalComponent),
        MockComponent(ConfirmationDialogComponent),
        FileSizePipe,
        TruncateTextPipe,
        ProjectTypeNamePipe,
        ProjectProgressColorPipe,
      ],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AttachmentsService, useValue: mockAttachmentsService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ProjectFormService, useValue: mockProjectFormService },
        DatePipe,
        TitleCasePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadProjects', () => {
    it('should load projects and attachments successfully', () => {
      mockProjectService.getAllProjects.and.returnValue(
        of({
          data: mockProjects,
          totalItems: 2,
        })
      );

      mockAttachmentsService.getFilesByEntity.and.returnValue(
        of(mockAttachments)
      );

      component.loadProjects();

      expect(mockProjectService.getAllProjects).toHaveBeenCalledWith(0, 10);
      expect(component.projects().length).toBe(2);
      expect(component.projects()[0].attachments).toEqual(mockAttachments);
      expect(component.isLoading()).toBeFalse();
    });

    it('should handle error when loading projects', () => {
      mockProjectService.getAllProjects.and.returnValue(
        throwError(() => new Error('Error'))
      );

      component.loadProjects();

      expect(mockProjectService.getAllProjects).toHaveBeenCalled();
      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Не вдалося завантажити проекти'
      );
      expect(component.projects().length).toBe(0);
      expect(component.isLoading()).toBeFalse();
    });
  });

  describe('onPageChange', () => {
    it('should update pagination and load projects', () => {
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 5,
        length: 20,
      };

      spyOn(component, 'loadProjects');
      component.onPageChange(pageEvent);

      expect(component.pagination().page).toBe(1);
      expect(component.pagination().size).toBe(5);
      expect(component.loadProjects).toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('should delete project when confirmed', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', [
        'afterClosed',
      ]);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      mockDialog.open.and.returnValue(dialogRefSpy);
      mockProjectService.deleteProject.and.returnValue(of({}));

      component.deleteProject('1');

      expect(mockDialog.open).toHaveBeenCalledWith(
        ConfirmationDialogComponent,
        {
          width: '400px',
          data: {
            message:
              'Ви впевнені, що хочете видалити цей проєкт? Цю дію не можна скасувати.',
          },
        }
      );

      expect(mockProjectService.deleteProject).toHaveBeenCalledWith('1');
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Проєкт успішно видалено'
      );
    });

    it('should handle 403 error when deleting project', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', [
        'afterClosed',
      ]);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      mockDialog.open.and.returnValue(dialogRefSpy);

      const error = { status: 403 };
      mockProjectService.deleteProject.and.returnValue(throwError(() => error));

      component.deleteProject('1');

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'У вас немає дозволу на видалення цього проєкту'
      );
    });

    it('should handle other errors when deleting project', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', [
        'afterClosed',
      ]);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      mockDialog.open.and.returnValue(dialogRefSpy);

      mockProjectService.deleteProject.and.returnValue(
        throwError(() => new Error('Error'))
      );

      component.deleteProject('1');

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Не вдалося видалити проєкт'
      );
    });

    it('should not delete project when not confirmed', () => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', [
        'afterClosed',
      ]);
      dialogRefSpy.afterClosed.and.returnValue(of(false));
      mockDialog.open.and.returnValue(dialogRefSpy);

      component.deleteProject('1');

      expect(mockProjectService.deleteProject).not.toHaveBeenCalled();
    });
  });

  describe('editProject', () => {
    it('should update project when edit is confirmed', () => {
      const project = mockProjects[0];
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', [
        'afterClosed',
      ]);
      dialogRefSpy.afterClosed.and.returnValue(
        of({
          title: 'Updated Title',
          description: 'Updated Description',
          progress: 75,
          tagIds: [],
          attachments: [],
        })
      );

      mockDialog.open.and.returnValue(dialogRefSpy);
      mockProjectFormService.submitForm.and.returnValue(of({}));

      component.editProject(project);

      expect(mockDialog.open).toHaveBeenCalledWith(ProjectEditModalComponent, {
        width: '600px',
        data: { project },
      });

      expect(mockProjectFormService.submitForm).toHaveBeenCalled();
      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith(
        'Проєкт успішно оновлено'
      );
    });

    it('should handle error when updating project', () => {
      const project = mockProjects[0];
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', [
        'afterClosed',
      ]);
      dialogRefSpy.afterClosed.and.returnValue(
        of({
          title: 'Updated Title',
          description: 'Updated Description',
          progress: 75,
          tagIds: [],
          attachments: [],
        })
      );

      mockDialog.open.and.returnValue(dialogRefSpy);
      mockProjectFormService.submitForm.and.returnValue(
        throwError(() => new Error('Error'))
      );

      component.editProject(project);

      expect(mockNotificationService.showError).toHaveBeenCalledWith(
        'Не вдалося оновити проєкт'
      );
    });
  });
});
