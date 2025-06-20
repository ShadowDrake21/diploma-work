import { TestBed } from '@angular/core/testing';

import { ProjectLoaderService } from './project-loader.service';
import { ProjectDataService } from '../project-data/project-data.service';
import { ProjectFormService } from '../project-form/project-form.service';
import { ProjectService } from '../models/project.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectDTO } from '@models/project.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { FormGroup } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('ProjectLoaderService', () => {
  let service: ProjectLoaderService;
  let projectDataServiceMock: jasmine.SpyObj<ProjectDataService>;
  let projectFormServiceMock: jasmine.SpyObj<ProjectFormService>;
  let projectServiceMock: jasmine.SpyObj<ProjectService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockProject: ProjectDTO = {
    id: '1',
    type: ProjectType.PUBLICATION,
    title: 'Test Project',
    description: 'Test Project Description',
    progress: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tagIds: ['1', '2'],
    createdBy: 1,
  };

  const mockAttachments = [
    { id: '1', name: 'file1.pdf' },
    { id: '2', name: 'file2.pdf' },
  ];

  beforeEach(() => {
    projectDataServiceMock = jasmine.createSpyObj('ProjectDataService', [
      'getProjectWithAttachments',
    ]);
    projectFormServiceMock = jasmine.createSpyObj('ProjectFormService', [
      'createTypeForm',
      'createGeneralInfoForm',
      'createSpecificForm',
      'patchTypeForm',
      'patchGeneralInformationForm',
      'patchSpecificForm',
    ]);
    projectServiceMock = jasmine.createSpyObj('ProjectService', [
      'getPublicationByProjectId',
      'getPatentByProjectId',
      'getResearchByProjectId',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    // Mock forms
    projectFormServiceMock.createTypeForm.and.returnValue({} as FormGroup);
    projectFormServiceMock.createGeneralInfoForm.and.returnValue(
      {} as FormGroup
    );
    projectFormServiceMock.createSpecificForm
      .withArgs(ProjectType.PUBLICATION)
      .and.returnValue({} as FormGroup);
    projectFormServiceMock.createSpecificForm
      .withArgs(ProjectType.PATENT)
      .and.returnValue({} as FormGroup);
    projectFormServiceMock.createSpecificForm
      .withArgs(ProjectType.RESEARCH)
      .and.returnValue({} as FormGroup);

    TestBed.configureTestingModule({
      providers: [
        ProjectLoaderService,
        { provide: ProjectDataService, useValue: projectDataServiceMock },
        { provide: ProjectFormService, useValue: projectFormServiceMock },
        { provide: ProjectService, useValue: projectServiceMock },
      ],
    });
    service = TestBed.inject(ProjectLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadProject', () => {
    it('should load publication project successfully', (done) => {
      const pubData = { id: '1', title: 'Test Publication' };
      projectDataServiceMock.getProjectWithAttachments.and.returnValue(
        of({
          project: { ...mockProject, type: ProjectType.PUBLICATION },
          attachments: mockAttachments,
        })
      );
      projectServiceMock.getPublicationByProjectId.and.returnValue(of(pubData));

      service.loadProject('1').subscribe({
        next: (result) => {
          expect(result).toEqual(pubData);
          expect(projectFormServiceMock.patchTypeForm).toHaveBeenCalled();
          expect(
            projectFormServiceMock.patchGeneralInformationForm
          ).toHaveBeenCalled();
          expect(projectFormServiceMock.patchSpecificForm).toHaveBeenCalled();
          done();
        },
        error: done.fail,
      });
    });

    it('should load patent project successfully', (done) => {
      const patentData = { id: '1', title: 'Test Patent' };
      projectDataServiceMock.getProjectWithAttachments.and.returnValue(
        of({
          project: { ...mockProject, type: ProjectType.PATENT },
          attachments: mockAttachments,
        })
      );
      projectServiceMock.getPatentByProjectId.and.returnValue(of(patentData));

      service.loadProject('1').subscribe({
        next: (result) => {
          expect(result).toEqual(patentData);
          done();
        },
        error: done.fail,
      });
    });

    it('should handle project load error', (done) => {
      projectDataServiceMock.getProjectWithAttachments.and.returnValue(
        throwError(() => new Error('Load failed'))
      );

      service.loadProject('1').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося завантажити дані проєкту'
          );
          done();
        },
      });
    });

    it('should handle type data load error', (done) => {
      projectDataServiceMock.getProjectWithAttachments.and.returnValue(
        of({
          project: { ...mockProject, type: ProjectType.PUBLICATION },
          attachments: mockAttachments,
        })
      );
      projectServiceMock.getPublicationByProjectId.and.returnValue(
        throwError(() => new Error('Type load failed'))
      );

      service.loadProject('1').subscribe({
        next: () => done.fail('Should have failed'),
        error: (error) => {
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося завантажити дані публікації'
          );
          done();
        },
      });
    });
  });

  describe('clearAllForms', () => {
    it('should reset all forms', () => {
      const typeForm = jasmine.createSpyObj('FormGroup', ['reset', 'enable']);
      const generalForm = jasmine.createSpyObj('FormGroup', ['reset']);
      const pubForm = jasmine.createSpyObj('FormGroup', ['reset']);
      const patentForm = jasmine.createSpyObj('FormGroup', ['reset']);
      const researchForm = jasmine.createSpyObj('FormGroup', ['reset']);

      // Replace service forms with spy forms
      (service as any).typeForm = typeForm;
      (service as any).generalInformationForm = generalForm;
      (service as any).publicationsForm = pubForm;
      (service as any).patentsForm = patentForm;
      (service as any).researchesForm = researchForm;

      service.clearAllForms();

      expect(typeForm.reset).toHaveBeenCalled();
      expect(generalForm.reset).toHaveBeenCalled();
      expect(pubForm.reset).toHaveBeenCalled();
      expect(patentForm.reset).toHaveBeenCalled();
      expect(researchForm.reset).toHaveBeenCalled();
      expect(typeForm.enable).toHaveBeenCalled();
    });

    it('should handle form reset error', () => {
      const typeForm = jasmine.createSpyObj('FormGroup', ['reset']);
      typeForm.reset.and.throwError('Reset failed');
      (service as any).typeForm = typeForm;

      expect(() => service.clearAllForms()).not.toThrow();
      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Не вдалося очистити форми'
      );
    });
  });
});
