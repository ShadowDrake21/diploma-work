import { TestBed } from '@angular/core/testing';

import { ResearchDataService } from './research-data.service';
import { NotificationService } from '@core/services/notification.service';
import { ResearchService } from '../models/research.service';
import { statuses } from '@shared/content/project.content';
import { ProjectStatus } from '@shared/enums/project.enums';
import { ResearchStatuses } from '@models/research.model';
import { of, throwError } from 'rxjs';

describe('ResearchDataService', () => {
  let service: ResearchDataService;
  let researchServiceMock: jasmine.SpyObj<ResearchService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    researchServiceMock = jasmine.createSpyObj('ResearchService', [
      'create',
      'update',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ResearchDataService,
        { provide: ResearchService, useValue: researchServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    service = TestBed.inject(ResearchDataService);
  });

  describe('create', () => {
    it('should create research successfully', (done) => {
      const projectId = '123';
      const formValues = {
        research: {
          participantIds: ['1', '2'],
          budget: 1000,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          status: statuses[0].value,
          fundingSource: 'Test Funding',
        },
      };
      const mockResponse = { id: 'res123' };

      researchServiceMock.create.and.returnValue(of(mockResponse));

      service.create(projectId, formValues).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(researchServiceMock.create).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle API error', (done) => {
      const projectId = '123';
      const formValues = {
        research: {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
        },
      };
      const mockError = new Error('API Error');

      researchServiceMock.create.and.returnValue(throwError(() => mockError));

      service.create(projectId, formValues).subscribe({
        error: (error) => {
          expect(error).toEqual(mockError);
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося створити дослідницький запис'
          );
          done();
        },
      });
    });
  });

  describe('update', () => {
    it('should update research successfully', (done) => {
      const projectId = '123';
      const formValues = {
        research: {
          id: 'res123',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
        },
      };
      const mockResponse = { id: 'res123' };

      researchServiceMock.update.and.returnValue(of(mockResponse));

      service.update(projectId, formValues).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(researchServiceMock.update).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle missing research ID', (done) => {
      const projectId = '123';
      const formValues = {
        research: {
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
        },
      };

      service.update(projectId, formValues).subscribe({
        error: (error) => {
          expect(error.message).toBe(
            'Для оновлення потрібен ідентифікатор дослідження'
          );
          expect(notificationServiceMock.showError).toHaveBeenCalled();
          done();
        },
      });
    });

    it('should handle API error', (done) => {
      const projectId = '123';
      const formValues = {
        research: {
          id: 'res123',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
        },
      };
      const mockError = new Error('API Error');

      researchServiceMock.update.and.returnValue(throwError(() => mockError));

      service.update(projectId, formValues).subscribe({
        error: (error) => {
          expect(error).toEqual(mockError);
          expect(notificationServiceMock.showError).toHaveBeenCalledWith(
            'Не вдалося оновити дослідницький запис'
          );
          done();
        },
      });
    });
  });

  describe('buildCreateRequest', () => {
    it('should build correct create request with default values', () => {
      const projectId = '123';
      const formValue = {};

      const result = service['buildCreateRequest'](projectId, formValue);

      expect(result).toEqual({
        projectId: '123',
        participantIds: [],
        budget: 0,
        startDate: jasmine.stringMatching(
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
        ),
        endDate: jasmine.stringMatching(
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
        ),
        status: ResearchStatuses.COMPLETED,
        fundingSource: '',
      });
    });

    it('should build correct create request with provided values', () => {
      const projectId = '123';
      const formValue = {
        participantIds: ['1', '2'],
        budget: 1000,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        status: 'active',
        fundingSource: 'Test Funding',
      };

      const result = service['buildCreateRequest'](projectId, formValue);

      expect(result).toEqual({
        projectId: '123',
        participantIds: ['1', '2'],
        budget: 1000,
        startDate: '2023-01-01T00:00:00.000Z',
        endDate: '2023-12-31T00:00:00.000Z',
        status: ResearchStatuses.IN_PROGRESS,
        fundingSource: 'Test Funding',
      });
    });
  });
});
