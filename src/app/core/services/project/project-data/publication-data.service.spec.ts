import { TestBed } from '@angular/core/testing';

import { PublicationDataService } from './publication-data.service';
import { NotificationService } from '@core/services/notification.service';
import { of, throwError } from 'rxjs';
import { PublicationService } from '../models/publication.service';

describe('PublicationDataService', () => {
  let service: PublicationDataService;
  let publicationServiceMock: jasmine.SpyObj<PublicationService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    publicationServiceMock = jasmine.createSpyObj('PublicationService', [
      'createPublication',
      'updatePublication',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        PublicationDataService,
        { provide: PublicationService, useValue: publicationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    service = TestBed.inject(PublicationDataService);
  });

  describe('create', () => {
    it('should create publication successfully', (done) => {
      const projectId = '123';
      const formValues = {
        publication: {
          publicationDate: '2023-01-01',
          publicationSource: 'Test Source',
          doiIsbn: '123-456',
          startPage: 1,
          endPage: 10,
          journalVolume: 1,
          issueNumber: 1,
          authors: ['1', '2'],
        },
      };
      const mockResponse = { id: 'pub123' };

      publicationServiceMock.createPublication.and.returnValue(
        of(mockResponse)
      );

      service.create(projectId, formValues).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(publicationServiceMock.createPublication).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle missing publication date', (done) => {
      const projectId = '123';
      const formValues = {
        publication: {
          publicationSource: 'Test Source',
        },
      };

      service.create(projectId, formValues).subscribe({
        error: (error) => {
          expect(error.message).toBe('Потрібно вказати дату публікації');
          expect(notificationServiceMock.showError).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle API error', (done) => {
      const projectId = '123';
      const formValues = {
        publication: {
          publicationDate: '2023-01-01',
        },
      };
      const mockError = new Error('API Error');

      publicationServiceMock.createPublication.and.returnValue(
        throwError(() => mockError)
      );

      service.create(projectId, formValues).subscribe({
        error: (error) => {
          expect(error).toEqual(mockError);
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося створити запис публікації'
          );
          done();
        },
      });
    });
  });

  describe('update', () => {
    it('should update publication successfully', (done) => {
      const projectId = '123';
      const formValues = {
        publication: {
          id: 'pub123',
          publicationDate: '2023-01-01',
        },
      };
      const mockResponse = { id: 'pub123' };

      publicationServiceMock.updatePublication.and.returnValue(
        of(mockResponse)
      );

      service.update(projectId, formValues).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(publicationServiceMock.updatePublication).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle missing publication ID', (done) => {
      const projectId = '123';
      const formValues = {
        publication: {
          publicationDate: '2023-01-01',
        },
      };

      service.update(projectId, formValues).subscribe({
        error: (error) => {
          expect(error.message).toBe(
            'Для оновлення потрібен ідентифікатор публікації'
          );
          expect(notificationServiceMock.showError).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle API error', (done) => {
      const projectId = '123';
      const formValues = {
        publication: {
          id: 'pub123',
          publicationDate: '2023-01-01',
        },
      };
      const mockError = new Error('API Error');

      publicationServiceMock.updatePublication.and.returnValue(
        throwError(() => mockError)
      );

      service.update(projectId, formValues).subscribe({
        error: (error) => {
          expect(error).toEqual(mockError);
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося оновити запис публікації'
          );
          done();
        },
      });
    });
  });

  describe('buildCreateRequest', () => {
    it('should build correct create request', () => {
      const projectId = '123';
      const formValue = {
        publicationDate: '2023-01-01',
        publicationSource: 'Test Source',
        doiIsbn: '123-456',
        startPage: 1,
        endPage: 10,
        journalVolume: 1,
        issueNumber: 1,
        authors: ['1', '2'],
      };

      const result = service['buildCreateRequest'](projectId, formValue);

      expect(result).toEqual({
        projectId: '123',
        publicationDate: '2023-01-01',
        publicationSource: 'Test Source',
        doiIsbn: '123-456',
        startPage: 1,
        endPage: 10,
        journalVolume: 1,
        issueNumber: 1,
        authors: [1, 2],
      });
    });

    it('should throw error if publication date is missing', () => {
      const projectId = '123';
      const formValue = {};

      expect(() =>
        service['buildCreateRequest'](projectId, formValue)
      ).toThrowError('Потрібно вказати дату публікації');
    });
  });
});
