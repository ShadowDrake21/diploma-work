import { TestBed } from '@angular/core/testing';

import { ResearchFormService } from './research-form.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DateValidators } from '@pages/authentication/validators/date.validator';
import { statuses } from '@shared/content/project.content';

describe('ResearchFormService', () => {
  let service: ResearchFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResearchFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createForm', () => {
    it('should create a form with all required controls', () => {
      const form = service.createForm();

      expect(form instanceof FormGroup).toBeTrue();
      expect(form.get('id')).toBeInstanceOf(FormControl);
      expect(form.get('participantIds')).toBeInstanceOf(FormControl);
      expect(form.get('budget')).toBeInstanceOf(FormControl);
      expect(form.get('startDate')).toBeInstanceOf(FormControl);
      expect(form.get('endDate')).toBeInstanceOf(FormControl);
      expect(form.get('status')).toBeInstanceOf(FormControl);
      expect(form.get('fundingSource')).toBeInstanceOf(FormControl);
    });

    it('should set default values correctly', () => {
      const form = service.createForm();

      expect(form.get('id')?.value).toBeNull();
      expect(form.get('participantIds')?.value).toEqual([]);
      expect(form.get('budget')?.value).toBe(0);
      expect(form.get('startDate')?.value).toBeInstanceOf(Date);
      expect(form.get('endDate')?.value).toBeInstanceOf(Date);
      expect(form.get('status')?.value).toBe(statuses[0].value);
      expect(form.get('fundingSource')?.value).toBe('');
    });

    it('should set validators correctly', () => {
      const form = service.createForm();

      expect(
        form.get('participantIds')?.hasValidator(Validators.required)
      ).toBeTrue();
      expect(form.get('budget')?.hasValidator(Validators.required)).toBeTrue();
      expect(form.get('budget')?.hasValidator(Validators.min(0))).toBeTrue();
      expect(
        form.get('startDate')?.hasValidator(Validators.required)
      ).toBeTrue();
      expect(
        form
          .get('startDate')
          ?.hasValidator(DateValidators.validateStartDate('endDate'))
      ).toBeTrue();
      expect(form.get('endDate')?.hasValidator(Validators.required)).toBeTrue();
      expect(
        form
          .get('endDate')
          ?.hasValidator(DateValidators.validateEndDate('startDate'))
      ).toBeTrue();
      expect(form.get('status')?.hasValidator(Validators.required)).toBeTrue();
      expect(
        form.get('fundingSource')?.hasValidator(Validators.required)
      ).toBeTrue();
    });
  });

  describe('patchForm', () => {
    it('should patch form values correctly', () => {
      const form = service.createForm();
      const mockResearch = {
        id: 'research1',
        participantIds: ['user1', 'user2'],
        budget: 5000,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        status: 'active',
        fundingSource: 'National Foundation',
      };

      service.patchForm(form, mockResearch);

      expect(form.get('id')?.value).toBe('research1');
      expect(form.get('participantIds')?.value).toEqual(['user1', 'user2']);
      expect(form.get('budget')?.value).toBe(5000);
      expect(form.get('startDate')?.value).toEqual(new Date('2023-01-01'));
      expect(form.get('endDate')?.value).toEqual(new Date('2023-12-31'));
      expect(form.get('status')?.value).toBe('active');
      expect(form.get('fundingSource')?.value).toBe('National Foundation');
    });

    it('should handle empty research data', () => {
      const form = service.createForm();
      const emptyResearch = {};

      expect(() => service.patchForm(form, emptyResearch)).not.toThrow();
    });

    it('should handle null dates', () => {
      const form = service.createForm();
      const researchWithNullDates = {
        startDate: null,
        endDate: null,
      };

      service.patchForm(form, researchWithNullDates);
      expect(form.get('startDate')?.value).toBeNull();
      expect(form.get('endDate')?.value).toBeNull();
    });
  });
});
