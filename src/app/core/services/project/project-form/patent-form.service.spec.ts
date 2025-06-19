import { TestBed } from '@angular/core/testing';

import { PatentFormService } from './patent-form.service';
import { PatentService } from '../models/patent.service';
import { NotificationService } from '@core/services/notification.service';
import { PatentDataService } from '../project-data/patent-data.service';
import { of } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';

describe('PatentFormService', () => {
  let service: PatentFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PatentFormService],
    });
    service = TestBed.inject(PatentFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createForm', () => {
    let form: FormGroup;

    beforeEach(() => {
      form = service.createForm();
    });

    it('should create a form with correct controls', () => {
      expect(form.contains('id')).toBeTrue();
      expect(form.contains('primaryAuthor')).toBeTrue();
      expect(form.contains('coInventors')).toBeTrue();
      expect(form.contains('registrationNumber')).toBeTrue();
      expect(form.contains('registrationDate')).toBeTrue();
      expect(form.contains('issuingAuthority')).toBeTrue();
    });

    it('should initialize id control with null value', () =>
      expect(form.get('id')?.value).toBeNull());

    it('should initialize primaryAuthor control with null and required validator', () => {
      const control = form.get('primaryAuthor');
      expect(control?.value).toBeNull();
      expect(control?.hasValidator(Validators.required)).toBeTrue();
    });

    it('should initialize coInventors control with empty array', () => {
      expect(form.get('coInventors')?.value).toEqual([]);
    });

    it('should initialize registrationNumber control with empty string and required validator', () => {
      const control = form.get('registrationNumber');
      expect(control?.value).toBe('');
      expect(control?.hasValidator(Validators.required)).toBeTrue();
    });

    it('should initialize registrationDate control with current date and required validator', () => {
      const control = form.get('registrationDate');
      expect(control?.value).toBeInstanceOf(Date);
      expect(control?.hasValidator(Validators.required)).toBeTrue();
    });

    it('should initialize issuingAuthority control with empty string and required validator', () => {
      const control = form.get('issuingAuthority');
      expect(control?.value).toBe('');
      expect(control?.hasValidator(Validators.required)).toBeTrue();
    });
  });

  describe('patchForm', () => {
    let form: FormGroup;
    const mockPatent = {
      id: 'patent-123',
      primaryAuthorId: 'author-456',
      coInventors: [1, 2, 3],
      registrationNumber: 'US1234567',
      registrationDate: '2023-01-15T00:00:00.000Z',
      issuingAuthority: 'USPTO',
    };

    beforeEach(() => {
      form = service.createForm();
      service.patchForm(form, mockPatent);
    });

    it('should patch id value correctly', () => {
      expect(form.get('id')?.value).toBe('patent-123');
    });

    it('should patch primaryAuthor value correctly', () => {
      expect(form.get('primaryAuthor')?.value).toBe('author-456');
    });

    it('should patch coInventors value correctly', () => {
      expect(form.get('coInventors')?.value).toEqual([1, 2, 3]);
    });

    it('should patch registrationNumber value correctly', () => {
      expect(form.get('registrationNumber')?.value).toBe('US1234567');
    });

    it('should patch registrationDate value as Date object', () => {
      const dateValue = form.get('registrationDate')?.value;
      expect(dateValue).toBeInstanceOf(Date);
      expect(dateValue.toISOString()).toContain('2023-01-15');
    });

    it('should patch issuingAuthority value correctly', () => {
      expect(form.get('issuingAuthority')?.value).toBe('USPTO');
    });

    it('should handle empty patent object gracefully', () => {
      const emptyForm = service.createForm();
      service.patchForm(emptyForm, {});

      expect(emptyForm.get('id')?.value).toBeNull();
      expect(emptyForm.get('primaryAuthor')?.value).toBeNull();
      expect(emptyForm.get('coInventors')?.value).toEqual([]);
      expect(emptyForm.get('registrationNumber')?.value).toBe('');
      expect(emptyForm.get('registrationDate')?.value).toBeInstanceOf(Date);
      expect(emptyForm.get('issuingAuthority')?.value).toBe('');
    });

    it('should handle partial patent object', () => {
      const partialForm = service.createForm();
      service.patchForm(partialForm, {
        registrationNumber: 'US7654321',
        issuingAuthority: 'EPO',
      });

      expect(partialForm.get('id')?.value).toBeNull();
      expect(partialForm.get('primaryAuthor')?.value).toBeNull();
      expect(partialForm.get('coInventors')?.value).toEqual([]);
      expect(partialForm.get('registrationNumber')?.value).toBe('US7654321');
      expect(partialForm.get('registrationDate')?.value).toBeInstanceOf(Date);
      expect(partialForm.get('issuingAuthority')?.value).toBe('EPO');
    });
  });
});
