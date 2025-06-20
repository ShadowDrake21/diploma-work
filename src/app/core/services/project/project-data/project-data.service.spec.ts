import { TestBed } from '@angular/core/testing';

import { ProjectDataService } from './project-data.service';
import { ProjectService } from '../models/project.service';
import { AttachmentsService } from '@core/services/attachments.service';
import { NotificationService } from '@core/services/notification.service';
import { PatentDataService } from './patent-data.service';
import { PublicationDataService } from './publication-data.service';
import { ResearchDataService } from './research-data.service';
import {
  CreateProjectRequest,
  ProjectDTO,
  UpdateProjectRequest,
} from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

describe('ProjectDataService', () => {
  let service: ProjectDataService;
  let projectServiceMock: jasmine.SpyObj<ProjectService>;
  let attachmentsServiceMock: jasmine.SpyObj<AttachmentsService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;
  let publicationDataServiceMock: jasmine.SpyObj<PublicationDataService>;
  let patentDataServiceMock: jasmine.SpyObj<PatentDataService>;
  let researchDataServiceMock: jasmine.SpyObj<ResearchDataService>;

  const mockProject: ProjectDTO = {
    id: '1',
    title: 'Test Project',
    description: 'Test Description',
    type: ProjectType.PUBLICATION,
    progress: 50,
    tagIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 1,
  };

  const mockFormValues = {
    publication: { journal: 'Test Journal' },
    patent: null,
    research: null,
  };

  const mockFile = new File(['content'], 'test.txt');

  beforeEach(() => {
    projectServiceMock = jasmine.createSpyObj('ProjectService', [
      'getProjectById',
      'createProject',
      'updateProject',
      'deleteProject',
    ]);
    attachmentsServiceMock = jasmine.createSpyObj('AttachmentsService', [
      'getFilesByEntity',
      'uploadFiles',
      'updateFiles',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
      'showSuccess',
    ]);
    publicationDataServiceMock = jasmine.createSpyObj(
      'PublicationDataService',
      ['create', 'update']
    );
    patentDataServiceMock = jasmine.createSpyObj('PatentDataService', [
      'create',
      'update',
    ]);
    researchDataServiceMock = jasmine.createSpyObj('ResearchDataService', [
      'create',
      'update',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProjectDataService,
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: AttachmentsService, useValue: attachmentsServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        {
          provide: PublicationDataService,
          useValue: publicationDataServiceMock,
        },
        { provide: PatentDataService, useValue: patentDataServiceMock },
        { provide: ResearchDataService, useValue: researchDataServiceMock },
      ],
    });

    service = TestBed.inject(ProjectDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createProject', () => {
    const createRequest: CreateProjectRequest = {
      title: 'New Project',
      description: 'New Description',
      type: ProjectType.PUBLICATION,
      progress: 0,
      tagIds: [],
      createdBy: 1,
    };

    it('should create project successfully without attachments', () => {
      projectServiceMock.createProject.and.returnValue(of(mockProject));
      publicationDataServiceMock.create.and.returnValue(of(null));

      service.createProject(createRequest, [], mockFormValues).subscribe(() => {
        expect(projectServiceMock.createProject).toHaveBeenCalledWith(
          createRequest
        );
        expect(publicationDataServiceMock.create).toHaveBeenCalledWith(
          '1',
          mockFormValues
        );
        expect(attachmentsServiceMock.uploadFiles).not.toHaveBeenCalled();
      });
    });

    it('should create project successfully with attachments', () => {
      projectServiceMock.createProject.and.returnValue(of(mockProject));
      publicationDataServiceMock.create.and.returnValue(of(null));
      attachmentsServiceMock.uploadFiles.and.returnValue(of([]));

      service
        .createProject(createRequest, [mockFile], mockFormValues)
        .subscribe(() => {
          expect(attachmentsServiceMock.uploadFiles).toHaveBeenCalledWith(
            ProjectType.PUBLICATION,
            mockProject.id,
            [mockFile]
          );
        });
    });

    it('should handle error during project creation', () => {
      const error = new HttpErrorResponse({ status: 409 });
      projectServiceMock.createProject.and.returnValue(throwError(() => error));

      service.createProject(createRequest, [], mockFormValues).subscribe({
        error: () => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Проєкт із такою назвою вже існує'
          );
        },
      });
    });

    it('should rollback when typed project creation fails', () => {
      projectServiceMock.createProject.and.returnValue(of(mockProject));
      const error = new HttpErrorResponse({ status: 500 });
      publicationDataServiceMock.create.and.returnValue(
        throwError(() => error)
      );
      projectServiceMock.deleteProject.and.returnValue(of(null));

      service.createProject(createRequest, [], mockFormValues).subscribe({
        error: () => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося завершити створення проєкту. Повернення назад...'
          );
          expect(projectServiceMock.deleteProject).toHaveBeenCalledWith('1');
        },
      });
    });
  });

  describe('updateProject', () => {
    const updateRequest: UpdateProjectRequest = {
      title: 'Updated Project',
      description: 'Updated Description',
      type: ProjectType.PUBLICATION,
      progress: 50,
      tagIds: [],
    };

    it('should update project successfully without attachments', () => {
      projectServiceMock.getProjectById.and.returnValue(of(mockProject));
      projectServiceMock.updateProject.and.returnValue(of(null));
      publicationDataServiceMock.update.and.returnValue(of(null));

      service
        .updateProject('1', updateRequest, [], mockFormValues)
        .subscribe(() => {
          expect(projectServiceMock.updateProject).toHaveBeenCalledWith(
            '1',
            updateRequest
          );
          expect(publicationDataServiceMock.update).toHaveBeenCalledWith(
            '1',
            mockFormValues
          );
          expect(attachmentsServiceMock.updateFiles).not.toHaveBeenCalled();
        });
    });

    it('should update project successfully with attachments', () => {
      projectServiceMock.getProjectById.and.returnValue(of(mockProject));
      projectServiceMock.updateProject.and.returnValue(of(null));
      publicationDataServiceMock.update.and.returnValue(of(null));
      attachmentsServiceMock.updateFiles.and.returnValue(of([]));

      service
        .updateProject('1', updateRequest, [mockFile], mockFormValues)
        .subscribe(() => {
          expect(attachmentsServiceMock.updateFiles).toHaveBeenCalledWith(
            ProjectType.PUBLICATION,
            '1',
            [mockFile]
          );
        });
    });

    it('should handle 403 error during update', () => {
      const error = new HttpErrorResponse({ status: 403 });
      projectServiceMock.getProjectById.and.returnValue(of(mockProject));
      projectServiceMock.updateProject.and.returnValue(throwError(() => error));

      service.updateProject('1', updateRequest, [], mockFormValues).subscribe({
        error: () => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'У вас немає дозволу на оновлення цього проєкту'
          );
        },
      });
    });

    it('should rollback when typed project update fails', () => {
      projectServiceMock.getProjectById.and.returnValue(of(mockProject));
      projectServiceMock.updateProject.and.returnValue(of(null));
      const error = new HttpErrorResponse({ status: 500 });
      publicationDataServiceMock.update.and.returnValue(
        throwError(() => error)
      );
      projectServiceMock.updateProject.and.returnValue(of(null));

      service.updateProject('1', updateRequest, [], mockFormValues).subscribe({
        error: () => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося завершити оновлення проекту. Повернення назад...'
          );
          expect(projectServiceMock.updateProject).toHaveBeenCalledWith('1', {
            title: 'Test Project',
            description: 'Test Description',
            type: ProjectType.PUBLICATION,
            progress: 50,
            tagIds: [],
          });
        },
      });
    });
  });

  describe('createTypedProject', () => {
    it('should create publication type project', () => {
      publicationDataServiceMock.create.and.returnValue(of(null));

      service['createTypedProject'](
        '1',
        ProjectType.PUBLICATION,
        mockFormValues
      ).subscribe(() => {
        expect(publicationDataServiceMock.create).toHaveBeenCalledWith(
          '1',
          mockFormValues
        );
      });
    });

    it('should create patent type project', () => {
      patentDataServiceMock.create.and.returnValue(of(null));

      service['createTypedProject']('1', ProjectType.PATENT, {
        ...mockFormValues,
        patent: { number: '123' },
        publication: null,
      }).subscribe(() => {
        expect(patentDataServiceMock.create).toHaveBeenCalled();
      });
    });

    it('should create research type project', () => {
      researchDataServiceMock.create.and.returnValue(of(null));

      service['createTypedProject']('1', ProjectType.RESEARCH, {
        ...mockFormValues,
        research: { field: 'Test' },
        publication: null,
      }).subscribe(() => {
        expect(researchDataServiceMock.create).toHaveBeenCalled();
      });
    });
  });

  describe('updateTypedProject', () => {
    it('should update publication type project', () => {
      publicationDataServiceMock.update.and.returnValue(of(null));

      service['updateTypedProject'](
        '1',
        ProjectType.PUBLICATION,
        mockFormValues
      ).subscribe(() => {
        expect(publicationDataServiceMock.update).toHaveBeenCalledWith(
          '1',
          mockFormValues
        );
      });
    });

    it('should update patent type project', () => {
      patentDataServiceMock.update.and.returnValue(of(null));

      service['updateTypedProject']('1', ProjectType.PATENT, {
        ...mockFormValues,
        patent: { number: '123' },
        publication: null,
      }).subscribe(() => {
        expect(patentDataServiceMock.update).toHaveBeenCalled();
      });
    });

    it('should update research type project', () => {
      researchDataServiceMock.update.and.returnValue(of(null));

      service['updateTypedProject']('1', ProjectType.RESEARCH, {
        ...mockFormValues,
        research: { field: 'Test' },
        publication: null,
      }).subscribe(() => {
        expect(researchDataServiceMock.update).toHaveBeenCalled();
      });
    });
  });
});
