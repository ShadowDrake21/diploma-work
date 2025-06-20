import { TestBed } from '@angular/core/testing';

import { ProjectFormCoreService } from './project-form-core.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { FormGroup, FormControl } from '@angular/forms';
import { FileMetadataDTO } from '@models/file.model';

describe('ProjectFormCoreService', () => {
  let service: ProjectFormCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectFormCoreService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createTypeForm', () => {
    it('should create a type form with required validator', () => {
      const form = service.createTypeForm();
      expect(form).toBeInstanceOf(FormGroup);
      expect(form.get('type')).toBeInstanceOf(FormControl);
      expect(form.get('type')?.validator).toBeTruthy();
    });
  });

  describe('createGeneralInfoForm', () => {
    it('should create a general info form with all controls', () => {
      const form = service.createGeneralInfoForm();
      expect(form).toBeInstanceOf(FormGroup);
      expect(form.get('title')).toBeInstanceOf(FormControl);
      expect(form.get('description')).toBeInstanceOf(FormControl);
      expect(form.get('progress')).toBeInstanceOf(FormControl);
      expect(form.get('tags')).toBeInstanceOf(FormControl);
      expect(form.get('attachments')).toBeInstanceOf(FormControl);
    });

    it('should have required validators for title and description', () => {
      const form = service.createGeneralInfoForm();
      expect(form.get('title')?.hasError('required')).toBeTruthy();
      expect(form.get('description')?.hasError('required')).toBeTruthy();
    });

    it('should have min/max validators for progress', () => {
      const form = service.createGeneralInfoForm();
      form.get('progress')?.setValue(-1);
      expect(form.get('progress')?.hasError('min')).toBeTruthy();
      form.get('progress')?.setValue(101);
      expect(form.get('progress')?.hasError('max')).toBeTruthy();
    });
  });

  describe('patchTypeForm', () => {
    it('should patch and disable the form', () => {
      const form = service.createTypeForm();
      service.patchTypeForm(form, ProjectType.PUBLICATION);
      expect(form.get('type')?.value).toBe(ProjectType.PUBLICATION);
      expect(form.disabled).toBeTrue();
      expect(form.pristine).toBeTrue();
      expect(form.untouched).toBeTrue();
    });

    it('should not throw when form is null', () => {
      expect(() =>
        service.patchTypeForm(null as any, ProjectType.PUBLICATION)
      ).not.toThrow();
    });
  });

  describe('patchGeneralInformationForm', () => {
    it('should patch form values correctly', () => {
      const form = service.createGeneralInfoForm();
      const mockProject = {
        title: 'Test Title',
        description: 'Test Description',
        progress: 50,
        tagIds: ['tag1', 'tag2'],
        attachments: [
          {
            id: '1',
            fileName: 'file.pdf',
            fileUrl: 'https://example.com/file.pdf',
            entityType: ProjectType.PUBLICATION,
            entityId: 'project1',
            uploadedAt: new Date().toISOString(),
            fileSize: 1024,
          } as FileMetadataDTO,
        ],
      };

      service.patchGeneralInformationForm(form, mockProject);

      expect(form.get('title')?.value).toBe('Test Title');
      expect(form.get('description')?.value).toBe('Test Description');
      expect(form.get('progress')?.value).toBe(50);
      expect(form.get('tags')?.value).toEqual(['tag1', 'tag2']);
      expect(form.get('attachments')?.value).toEqual([
        {
          id: '1',
          fileName: 'file.pdf',
          fileUrl: 'https://example.com/file.pdf',
          entityType: ProjectType.PUBLICATION,
          entityId: 'project1',
          uploadedAt: new Date().toISOString(),
          fileSize: 1024,
        },
      ]);
      expect(form.touched).toBeTrue();
    });

    it('should handle empty attachments', () => {
      const form = service.createGeneralInfoForm();
      const mockProject = {
        title: 'Test',
        description: 'Test',
        progress: 0,
        tagIds: [],
        attachments: null,
      };

      service.patchGeneralInformationForm(form, mockProject);
      expect(form.get('attachments')?.value).toEqual([]);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe all subscriptions', () => {
      const mockSub = { unsubscribe: jasmine.createSpy('unsubscribe') };
      (service as any).subscriptions.push(mockSub);
      service.ngOnDestroy();
      expect(mockSub.unsubscribe).toHaveBeenCalled();
    });
  });
});
