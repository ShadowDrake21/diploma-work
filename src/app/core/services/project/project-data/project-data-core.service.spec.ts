import { TestBed } from '@angular/core/testing';

import { ProjectDataCoreService } from './project-data-core.service';
import { ProjectService } from '../models/project.service';
import { AttachmentsService } from '@core/services/attachments.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectDTO } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { FileMetadataDTO } from '@models/file.model';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('ProjectDataCoreService', () => {
  let service: ProjectDataCoreService;
  let projectServiceMock: jasmine.SpyObj<ProjectService>;
  let attachmentsServiceMock: jasmine.SpyObj<AttachmentsService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockProject: ProjectDTO = {
    id: '1',
    title: 'Test Project',
    description: 'Test Description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    type: ProjectType.PUBLICATION,
    progress: 50,
    createdBy: 1,
    tagIds: [],
  };

  const mockAttachments: FileMetadataDTO[] = [
    {
      id: '1',
      fileName: 'file1.pdf',
      fileSize: 1000,
      entityId: '1',
      entityType: ProjectType.PUBLICATION,
      fileUrl: 'http://example.com/file1.pdf',
      uploadedAt: new Date().toISOString(),
      checksum: 'abc123',
    },
  ];

  beforeEach(() => {
    projectServiceMock = jasmine.createSpyObj('ProjectService', [
      'getProjectById',
    ]);
    attachmentsServiceMock = jasmine.createSpyObj('AttachmentsService', [
      'getFilesByEntity',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
      'showSuccess',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProjectDataCoreService,
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: AttachmentsService, useValue: attachmentsServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    service = TestBed.inject(ProjectDataCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjectById', () => {
    it('should return project when successful', () => {
      projectServiceMock.getProjectById.and.returnValue(of(mockProject));

      service.getProjectById('1').subscribe((project) => {
        expect(project).toEqual(mockProject);
        expect(projectServiceMock.getProjectById).toHaveBeenCalledWith('1');
      });
    });

    it('should handle 404 error', () => {
      const error = new HttpErrorResponse({ status: 404 });
      projectServiceMock.getProjectById.and.returnValue(
        throwError(() => error)
      );

      service.getProjectById('1').subscribe({
        error: () => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Проєкт не знайдено'
          );
        },
      });
    });

    it('should handle 403 error', () => {
      const error = new HttpErrorResponse({ status: 403 });
      projectServiceMock.getProjectById.and.returnValue(
        throwError(() => error)
      );

      service.getProjectById('1').subscribe({
        error: () => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'У вас немає дозволу на перегляд цього проєкту'
          );
        },
      });
    });

    it('should handle generic error', () => {
      const error = new HttpErrorResponse({ status: 500 });
      projectServiceMock.getProjectById.and.returnValue(
        throwError(() => error)
      );

      service.getProjectById('1').subscribe({
        error: () => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося load проєкт'
          );
        },
      });
    });
  });

  describe('getAttachments', () => {
    it('should return attachments when successful', () => {
      attachmentsServiceMock.getFilesByEntity.and.returnValue(
        of(mockAttachments)
      );

      service
        .getAttachments(ProjectType.PUBLICATION, '1')
        .subscribe((attachments) => {
          expect(attachments).toEqual(mockAttachments);
          expect(attachmentsServiceMock.getFilesByEntity).toHaveBeenCalledWith(
            ProjectType.PUBLICATION,
            '1'
          );
        });
    });

    it('should handle error', () => {
      const error = new HttpErrorResponse({ status: 500 });
      attachmentsServiceMock.getFilesByEntity.and.returnValue(
        throwError(() => error)
      );

      service.getAttachments(ProjectType.PUBLICATION, '1').subscribe({
        error: () => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося додати вкладення до проекту'
          );
        },
      });
    });
  });

  describe('getProjectWithAttachments', () => {
    it('should return project with attachments when both succeed', () => {
      projectServiceMock.getProjectById.and.returnValue(of(mockProject));
      attachmentsServiceMock.getFilesByEntity.and.returnValue(
        of(mockAttachments)
      );

      service.getProjectWithAttachments('1').subscribe((result) => {
        expect(result.project).toEqual(mockProject);
        expect(result.attachments).toEqual(mockAttachments);
      });
    });

    it('should return project with empty attachments when attachments fail', () => {
      projectServiceMock.getProjectById.and.returnValue(of(mockProject));
      const error = new HttpErrorResponse({ status: 500 });
      attachmentsServiceMock.getFilesByEntity.and.returnValue(
        throwError(() => error)
      );

      service.getProjectWithAttachments('1').subscribe((result) => {
        expect(result.project).toEqual(mockProject);
        expect(result.attachments).toEqual([]);
        expect(notificationServiceMock.showError).toHaveBeenCalledWith(
          'Проєкт завантажено, але додатки не вдалося завантажити'
        );
      });
    });

    it('should throw error when project fails', () => {
      const error = new HttpErrorResponse({ status: 500 });
      projectServiceMock.getProjectById.and.returnValue(
        throwError(() => error)
      );

      service.getProjectWithAttachments('1').subscribe({
        error: () => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося завантажити проєкт із вкладеннями'
          );
        },
      });
    });
  });
});
