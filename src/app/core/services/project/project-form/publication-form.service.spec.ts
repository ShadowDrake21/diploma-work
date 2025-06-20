import { TestBed } from '@angular/core/testing';

import { PublicationFormService } from './publication-form.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PublicationDTO } from '@models/publication.model';
import { DateValidators } from '@pages/authentication/validators/date.validator';
import { PageValidators } from '@pages/authentication/validators/page.validator';

describe('PublicationFormService', () => {
  let service: PublicationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicationFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createForm', () => {
    it('should create a form with all required controls', () => {
      const form = service.createForm();

      expect(form instanceof FormGroup).toBeTrue();
      expect(form.get('id')).toBeInstanceOf(FormControl);
      expect(form.get('authors')).toBeInstanceOf(FormControl);
      expect(form.get('publicationDate')).toBeInstanceOf(FormControl);
      expect(form.get('publicationSource')).toBeInstanceOf(FormControl);
      expect(form.get('doiIsbn')).toBeInstanceOf(FormControl);
      expect(form.get('startPage')).toBeInstanceOf(FormControl);
      expect(form.get('endPage')).toBeInstanceOf(FormControl);
      expect(form.get('journalVolume')).toBeInstanceOf(FormControl);
      expect(form.get('issueNumber')).toBeInstanceOf(FormControl);
    });

    it('should set default values correctly', () => {
      const form = service.createForm();

      expect(form.get('id')?.value).toBeNull();
      expect(form.get('authors')?.value).toEqual([]);
      expect(form.get('publicationDate')?.value).toBeInstanceOf(Date);
      expect(form.get('publicationSource')?.value).toBe('');
      expect(form.get('doiIsbn')?.value).toBe('');
      expect(form.get('startPage')?.value).toBe(1);
      expect(form.get('endPage')?.value).toBe(10);
      expect(form.get('journalVolume')?.value).toBe(1);
      expect(form.get('issueNumber')?.value).toBe(1);
    });

    it('should set validators correctly', () => {
      const form = service.createForm();

      expect(form.get('authors')?.hasValidator(Validators.required)).toBeTrue();
      expect(
        form.get('publicationDate')?.hasValidator(Validators.required)
      ).toBeTrue();
      expect(
        form
          .get('publicationDate')
          ?.hasValidator(DateValidators.validatePublicationDate)
      ).toBeTrue();
      expect(
        form.get('publicationSource')?.hasValidator(Validators.required)
      ).toBeTrue();
      expect(form.get('doiIsbn')?.hasValidator(Validators.required)).toBeTrue();
      expect(
        form.get('startPage')?.hasValidator(Validators.required)
      ).toBeTrue();
      expect(form.get('startPage')?.hasValidator(Validators.min(1))).toBeTrue();
      expect(
        form
          .get('startPage')
          ?.hasValidator(PageValidators.validateStartPage('endPage'))
      ).toBeTrue();
      expect(form.get('endPage')?.hasValidator(Validators.required)).toBeTrue();
      expect(form.get('endPage')?.hasValidator(Validators.min(1))).toBeTrue();
      expect(
        form
          .get('endPage')
          ?.hasValidator(PageValidators.validateEndPage('startPage'))
      ).toBeTrue();
      expect(
        form.get('journalVolume')?.hasValidator(Validators.required)
      ).toBeTrue();
      expect(
        form.get('journalVolume')?.hasValidator(Validators.min(1))
      ).toBeTrue();
      expect(
        form.get('issueNumber')?.hasValidator(Validators.required)
      ).toBeTrue();
      expect(
        form.get('issueNumber')?.hasValidator(Validators.min(1))
      ).toBeTrue();
    });
  });

  describe('patchForm', () => {
    it('should patch form values correctly', () => {
      const form = service.createForm();
      const mockPublication: PublicationDTO = {
        id: '123',
        authors: [
          { id: 1, username: 'author1' },
          { id: 2, username: 'author2' },
        ],
        publicationDate: '2023-01-01',
        publicationSource: 'Test Journal',
        doiIsbn: 'doi:12345',
        startPage: 5,
        endPage: 15,
        journalVolume: 2,
        issueNumber: 3,
        projectId: 'project1',
      };

      service.patchForm(form, mockPublication);

      expect(form.get('id')?.value).toBe('123');
      expect(form.get('authors')?.value).toEqual(['author1', 'author2']);
      expect(form.get('publicationDate')?.value).toEqual(
        new Date('2023-01-01')
      );
      expect(form.get('publicationSource')?.value).toBe('Test Journal');
      expect(form.get('doiIsbn')?.value).toBe('doi:12345');
      expect(form.get('startPage')?.value).toBe(5);
      expect(form.get('endPage')?.value).toBe(15);
      expect(form.get('journalVolume')?.value).toBe(2);
      expect(form.get('issueNumber')?.value).toBe(3);
    });

    it('should handle empty publication data', () => {
      const form = service.createForm();
      const emptyPublication = {} as PublicationDTO;

      expect(() => service.patchForm(form, emptyPublication)).not.toThrow();
    });
  });
});
