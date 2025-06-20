import { TestBed } from '@angular/core/testing';

import { PatentDataService } from './patent-data.service';
import { NotificationService } from '@core/services/notification.service';
import { PatentService } from '../models/patent.service';
import { of, throwError } from 'rxjs';

describe('PatentDataService', () => {
  let service: PatentDataService;
  let patentService: jasmine.SpyObj<PatentService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  const mockFormValues = {
    patent: {
      id: '1',
      primaryAuthor: '1',
      registrationNumber: '12345',
      registrationDate: new Date(),
      issuingAuthority: 'Test Authority',
      coInventors: ['2', '3'],
    },
  };

  beforeEach(() => {
    const patentServiceSpy = jasmine.createSpyObj('PatentService', [
      'createPatent',
      'updatePatent',
    ]);
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        PatentDataService,
        { provide: PatentService, useValue: patentServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });

    service = TestBed.inject(PatentDataService);
    patentService = TestBed.inject(
      PatentService
    ) as jasmine.SpyObj<PatentService>;
    notificationService = TestBed.inject(
      NotificationService
    ) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('create', () => {
    it('should create a patent successfully', () => {
      const mockResponse = { id: '1' };
      patentService.createPatent.and.returnValue(of(mockResponse));

      service.create('project-1', mockFormValues).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      expect(patentService.createPatent).toHaveBeenCalled();
      expect(notificationService.showError).not.toHaveBeenCalled();
    });

    it('should handle create patent error', () => {
      const error = new Error('Test error');
      patentService.createPatent.and.returnValue(throwError(() => error));

      service.create('project-1', mockFormValues).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Не вдалося створити патентний запис'
          );
        },
      });
    });

    it('should handle missing primary author error', () => {
      const invalidFormValues = {
        ...mockFormValues,
        patent: { ...mockFormValues.patent, primaryAuthor: null },
      };

      service.create('project-1', invalidFormValues).subscribe({
        error: (err) => {
          expect(err.message).toBe('Потрібно вказати основного автора');
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Потрібно вказати основного автора'
          );
        },
      });

      expect(patentService.createPatent).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a patent successfully', () => {
      const mockResponse = { id: '1' };
      patentService.updatePatent.and.returnValue(of(mockResponse));

      service.update('project-1', mockFormValues).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      expect(patentService.updatePatent).toHaveBeenCalled();
      expect(notificationService.showError).not.toHaveBeenCalled();
    });

    it('should handle update patent error', () => {
      const error = new Error('Test error');
      patentService.updatePatent.and.returnValue(throwError(() => error));

      service.update('project-1', mockFormValues).subscribe({
        error: (err) => {
          expect(err).toEqual(error);
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Не вдалося оновити патентний запис'
          );
        },
      });
    });

    it('should handle missing patent id error', () => {
      const invalidFormValues = {
        ...mockFormValues,
        patent: { ...mockFormValues.patent, id: null },
      };

      service.update('project-1', invalidFormValues).subscribe({
        error: (err) => {
          expect(err.message).toBe(
            'Для оновлення потрібен ідентифікатор патенту'
          );
          expect(notificationService.showError).toHaveBeenCalledWith(
            'Для оновлення потрібен ідентифікатор патенту'
          );
        },
      });

      expect(patentService.updatePatent).not.toHaveBeenCalled();
    });
  });

  describe('buildCreateRequest', () => {
    it('should build valid create request', () => {
      const request = service['buildCreateRequest'](
        'project-1',
        mockFormValues
      );

      expect(request.projectId).toBe('project-1');
      expect(request.primaryAuthorId).toBe(1);
      expect(request.registrationNumber).toBe('12345');
      expect(request.coInventors).toEqual([2, 3]);
    });
    it('should throw error for missing primary author', () => {
      const invalidFormValues = {
        ...mockFormValues,
        patent: { ...mockFormValues.patent, primaryAuthor: null },
      };

      expect(() =>
        service['buildCreateRequest']('project-1', invalidFormValues.patent)
      ).toThrowError('Потрібно вказати основного автора');
    });
  });

  describe('buildUpdateRequest', () => {
    it('should build valid update request', () => {
      const request = service['buildUpdateRequest'](
        'project-1',
        mockFormValues.patent,
        '1'
      );

      expect(request.id).toBe('1');
      expect(request.projectId).toBe('project-1');
      expect(request.primaryAuthorId).toBe(1);
    });
  });
});
