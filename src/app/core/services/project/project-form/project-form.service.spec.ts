import { TestBed } from '@angular/core/testing';
import { ProjectFormService } from './project-form.service';
import { UserService } from '@core/services/users/user.service';
import { ProjectDataService } from '../project-data/project-data.service';
import { PatentFormService } from './patent-form.service';
import { PublicationFormService } from './publication-form.service';
import { ResearchFormService } from './research-form.service';
import { ResponseUserDTO } from '@models/user.model';
import { of, throwError } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectType } from '@shared/enums/categories.enum';
import { PublicationDTO } from '@models/publication.model';
import {
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@models/project.model';
import { FileMetadataDTO } from '@models/file.model';

describe('ProjectFormService', () => {
  let service: ProjectFormService;
  let projectDataServiceMock: jasmine.SpyObj<ProjectDataService>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let publicationFormServiceMock: jasmine.SpyObj<PublicationFormService>;
  let patentFormServiceMock: jasmine.SpyObj<PatentFormService>;
  let researchFormServiceMock: jasmine.SpyObj<ResearchFormService>;

  beforeEach(() => {
    projectDataServiceMock = jasmine.createSpyObj('ProjectDataService', [
      'createProject',
      'updateProject',
    ]);
    userServiceMock = jasmine.createSpyObj('UserService', ['getCurrentUser']);
    publicationFormServiceMock = jasmine.createSpyObj(
      'PublicationFormService',
      ['createForm', 'patchForm']
    );
    patentFormServiceMock = jasmine.createSpyObj('PatentFormService', [
      'createForm',
      'patchForm',
    ]);
    researchFormServiceMock = jasmine.createSpyObj('ResearchFormService', [
      'createForm',
      'patchForm',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProjectFormService,
        { provide: ProjectDataService, useValue: projectDataServiceMock },
        { provide: UserService, useValue: userServiceMock },
        {
          provide: PublicationFormService,
          useValue: publicationFormServiceMock,
        },
        { provide: PatentFormService, useValue: patentFormServiceMock },
        { provide: ResearchFormService, useValue: researchFormServiceMock },
      ],
    });
    service = TestBed.inject(ProjectFormService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should subscribe to current user', () => {
      const mockUser: ResponseUserDTO = { id: 1, username: 'Test User' };
      userServiceMock.getCurrentUser.and.returnValue(of(mockUser));
      const newService = TestBed.inject(ProjectFormService);
      expect(newService.creatorId).toBe(1);
    });

    it('should handle error when getting current user', () => {
      userServiceMock.getCurrentUser.and.returnValue(
        throwError(() => new Error('Error'))
      );
      const newService = TestBed.inject(ProjectFormService);
      expect(newService.creatorId).toBeNull();
    });
  });

  describe('createSpecificForm', () => {
    it('should create publication form', () => {
      const mockForm = new FormGroup({});
      publicationFormServiceMock.createForm.and.returnValue(mockForm);
      const form = service.createSpecificForm(ProjectType.PUBLICATION);
      expect(form).toBe(mockForm);
    });

    it('should create patent form', () => {
      const mockForm = new FormGroup({});
      patentFormServiceMock.createForm.and.returnValue(mockForm);
      const form = service.createSpecificForm(ProjectType.PATENT);
      expect(form).toBe(mockForm);
    });

    it('should create research form', () => {
      const mockForm = new FormGroup({});
      researchFormServiceMock.createForm.and.returnValue(mockForm);
      const form = service.createSpecificForm(ProjectType.RESEARCH);
      expect(form).toBe(mockForm);
    });

    it('should throw error for invalid type', () => {
      expect(() => service.createSpecificForm('INVALID' as any)).toThrowError(
        'Недійсний тип проекту'
      );
    });
  });

  describe('patchSpecificForm', () => {
    it('should patch publication form', () => {
      const mockForm = new FormGroup({});
      const mockData: PublicationDTO = {
        publicationDate: '2023-01-01',
        publicationSource: 'Test Source',
        doiIsbn: '123-456',
        startPage: 1,
        endPage: 10,
        journalVolume: 1,
        issueNumber: 1,
        authors: [
          {
            id: 1,
            username: 'Author One',
          },
          {
            id: 2,
            username: 'Author Two',
          },
        ],
        id: '1',
        projectId: '1',
      };
      service.patchSpecificForm(mockForm, mockData, ProjectType.PUBLICATION);
      expect(publicationFormServiceMock.patchForm).toHaveBeenCalledWith(
        mockForm,
        mockData
      );
    });

    it('should patch patent form', () => {
      const mockForm = new FormGroup({});
      const mockData = {};
      service.patchSpecificForm(mockForm, mockData, ProjectType.PATENT);
      expect(patentFormServiceMock.patchForm).toHaveBeenCalledWith(
        mockForm,
        mockData
      );
    });

    it('should patch research form', () => {
      const mockForm = new FormGroup({});
      const mockData = {};
      service.patchSpecificForm(mockForm, mockData, ProjectType.RESEARCH);
      expect(researchFormServiceMock.patchForm).toHaveBeenCalledWith(
        mockForm,
        mockData
      );
    });

    it('should throw error for invalid type', () => {
      const mockForm = new FormGroup({});
      expect(() =>
        service.patchSpecificForm(mockForm, {}, 'INVALID' as any)
      ).toThrowError('Недійсний тип проекту');
    });
  });

  describe('submitForm', () => {
    const mockTypeForm = new FormGroup({
      type: new FormControl<ProjectType | null>(ProjectType.PUBLICATION, [
        Validators.required,
      ]),
    });

    const mockGeneralInfoForm = new FormGroup({
      title: new FormControl<string>('Test Project', [Validators.required]),
      description: new FormControl<string>('Test Description', [
        Validators.required,
      ]),
      progress: new FormControl<number>(50, [
        Validators.min(0),
        Validators.max(100),
      ]),
      tags: new FormControl<string[]>(['tag1']),
      attachments: new FormControl<(File | FileMetadataDTO)[]>([]),
    });

    const mockWorkForm = new FormGroup({});
    const mockFiles = [new File([''], 'test.pdf')];

    beforeEach(() => {
      publicationFormServiceMock.createForm.and.returnValue(new FormGroup({}));
    });

    it('should call createProject for new project', (done) => {
      const mockResponse: PublicationDTO[] = [{} as PublicationDTO];
      projectDataServiceMock.createProject.and.returnValue(of(mockResponse));

      service
        .submitForm(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          null,
          1,
          mockFiles
        )
        .subscribe((response) => {
          expect(response).toBe(mockResponse);
          expect(projectDataServiceMock.createProject).toHaveBeenCalled();
          expect(service.loading.value).toBeFalse();
          done();
        });
    });

    it('should call updateProject for existing project', (done) => {
      const mockResponse: PublicationDTO[] = [{} as PublicationDTO];
      projectDataServiceMock.updateProject.and.returnValue(of(mockResponse));

      service
        .submitForm(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          '123',
          1,
          mockFiles
        )
        .subscribe((response) => {
          expect(response).toBe(mockResponse);
          expect(projectDataServiceMock.updateProject).toHaveBeenCalled();
          done();
        });
    });

    it('should handle error', (done) => {
      const mockError = new Error('Test Error');
      projectDataServiceMock.createProject.and.returnValue(
        throwError(() => mockError)
      );

      service
        .submitForm(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          null,
          1,
          mockFiles
        )
        .subscribe({
          error: (error) => {
            expect(error).toBe(mockError);
            expect(service.loading.value).toBeFalse();
            done();
          },
        });
    });
  });

  describe('buildProjectRequest', () => {
    it('should build create request', () => {
      const typeForm = new FormGroup({
        type: new FormControl<ProjectType | null>(ProjectType.PUBLICATION, [
          Validators.required,
        ]),
      });
      const generalInfoForm = new FormGroup({
        title: new FormControl<string>('Test', [Validators.required]),
        description: new FormControl<string>('Desc', [Validators.required]),
        progress: new FormControl<number>(50, [
          Validators.min(0),
          Validators.max(100),
        ]),
        tags: new FormControl<string[]>(['tag1']),
        attachments: new FormControl<(File | FileMetadataDTO)[]>([]),
      });

      const request = service['buildProjectRequest'](
        typeForm,
        generalInfoForm,
        1,
        false
      ) as CreateProjectRequest;

      expect(request.title).toBe('Test');
      expect(request.description).toBe('Desc');
      expect(request.type).toBe(ProjectType.PUBLICATION);
      expect(request.progress).toBe(50);
      expect(request.tagIds).toEqual(['tag1']);
      expect(request.createdBy).toBe(1);
    });

    it('should build update request', () => {
      const typeForm = new FormGroup({
        type: new FormControl<ProjectType | null>(ProjectType.PUBLICATION, [
          Validators.required,
        ]),
      });
      const generalInfoForm = new FormGroup({
        title: new FormControl<string>('Test', [Validators.required]),
        description: new FormControl<string>('Desc', [Validators.required]),
        progress: new FormControl<number>(50, [
          Validators.min(0),
          Validators.max(100),
        ]),
        tags: new FormControl<string[]>(['tag1']),
        attachments: new FormControl<(File | FileMetadataDTO)[]>([]),
      });

      const request = service['buildProjectRequest'](
        typeForm,
        generalInfoForm,
        1,
        true
      ) as UpdateProjectRequest;

      expect(request.title).toBe('Test');
      expect(request.description).toBe('Desc');
      expect(request.type).toBe(ProjectType.PUBLICATION);
      expect(request.progress).toBe(50);
      expect(request.tagIds).toEqual(['tag1']);
      expect((request as any).createdBy).toBeUndefined();
    });
  });

  describe('prepareFormValues', () => {
    it('should prepare publication values', () => {
      const values = service['prepareFormValues'](ProjectType.PUBLICATION, {
        field: 'value',
      });
      expect(values).toEqual({ publication: { field: 'value' } });
    });

    it('should prepare patent values', () => {
      const values = service['prepareFormValues'](ProjectType.PATENT, {
        field: 'value',
      });
      expect(values).toEqual({ patent: { field: 'value' } });
    });

    it('should prepare research values', () => {
      const values = service['prepareFormValues'](ProjectType.RESEARCH, {
        field: 'value',
      });
      expect(values).toEqual({ research: { field: 'value' } });
    });

    it('should return empty object for unknown type', () => {
      const values = service['prepareFormValues']('UNKNOWN' as any, {
        field: 'value',
      });
      expect(values).toEqual({});
    });
  });
});
