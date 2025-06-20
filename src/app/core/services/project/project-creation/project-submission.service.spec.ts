import { TestBed } from '@angular/core/testing';

import { ProjectSubmissionService } from './project-submission.service';
import { FormGroup } from '@angular/forms';
import { NotificationService } from '@core/services/notification.service';
import { ProjectFormService } from '../project-form/project-form.service';
import { BehaviorSubject, of, throwError } from 'rxjs';

describe('ProjectSubmissionService', () => {
  let service: ProjectSubmissionService;
  let projectFormServiceMock: jasmine.SpyObj<ProjectFormService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  const mockTypeForm = {} as FormGroup;
  const mockGeneralInfoForm = {} as FormGroup;
  const mockWorkForm = {} as FormGroup;
  const mockFiles = [new File(['content'], 'test.pdf')];

  beforeEach(() => {
    projectFormServiceMock = jasmine.createSpyObj(
      'ProjectFormService',
      ['submitForm'],
      {
        loading: new BehaviorSubject<boolean>(false),
      }
    );
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProjectSubmissionService,
        { provide: ProjectFormService, useValue: projectFormServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    service = TestBed.inject(ProjectSubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('submitProject', () => {
    it('should submit new project successfully', (done) => {
      const mockResponse = { id: '123', title: 'New Project' };
      projectFormServiceMock.submitForm.and.returnValue(of(mockResponse));

      service
        .submitProject(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          null,
          1,
          mockFiles
        )
        .subscribe({
          next: (response) => {
            expect(response).toEqual(mockResponse);
            expect(projectFormServiceMock.loading.value).toBeFalse();
            done();
          },
          error: done.fail,
        });

      expect(projectFormServiceMock.loading.value).toBeTrue();
    });

    it('should update existing project successfully', (done) => {
      const mockResponse = { id: '123', title: 'Updated Project' };
      projectFormServiceMock.submitForm.and.returnValue(of(mockResponse));

      service
        .submitProject(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          '123',
          1,
          mockFiles
        )
        .subscribe({
          next: (response) => {
            expect(response).toEqual(mockResponse);
            done();
          },
          error: done.fail,
        });
    });

    it('should handle 409 conflict error', (done) => {
      const error = { status: 409 };
      projectFormServiceMock.submitForm.and.returnValue(
        throwError(() => error)
      );

      service
        .submitProject(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          null,
          1,
          mockFiles
        )
        .subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(notificationServiceMock.showError).toHaveBeenCalledWith(
              'Проєкт із подібними деталями вже існує'
            );
            expect(projectFormServiceMock.loading.value).toBeFalse();
            done();
          },
        });
    });

    it('should handle 400 bad request error', (done) => {
      const error = { status: 400 };
      projectFormServiceMock.submitForm.and.returnValue(
        throwError(() => error)
      );

      service
        .submitProject(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          null,
          1,
          mockFiles
        )
        .subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(notificationServiceMock.showError).toHaveBeenCalledWith(
              'Недійсні дані проєкту. Будь ласка, перевірте введені дані.'
            );
            done();
          },
        });
    });

    it('should handle 403 forbidden error', (done) => {
      const error = { status: 403 };
      projectFormServiceMock.submitForm.and.returnValue(
        throwError(() => error)
      );

      service
        .submitProject(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          '123',
          1,
          mockFiles
        )
        .subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(notificationServiceMock.showError).toHaveBeenCalledWith(
              'У вас немає дозволу на виконання цієї дії'
            );
            done();
          },
        });
    });

    it('should handle generic error for new project', (done) => {
      projectFormServiceMock.submitForm.and.returnValue(
        throwError(() => new Error('Generic error'))
      );

      service
        .submitProject(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          null,
          1,
          mockFiles
        )
        .subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(notificationServiceMock.showError).toHaveBeenCalledWith(
              'Не вдалося створити проєкт. Спробуйте ще раз.'
            );
            done();
          },
        });
    });

    it('should handle generic error for existing project', (done) => {
      projectFormServiceMock.submitForm.and.returnValue(
        throwError(() => new Error('Generic error'))
      );

      service
        .submitProject(
          mockTypeForm,
          mockGeneralInfoForm,
          mockWorkForm,
          '123',
          1,
          mockFiles
        )
        .subscribe({
          next: () => done.fail('Should have failed'),
          error: (error) => {
            expect(notificationServiceMock.showError).toHaveBeenCalledWith(
              'Не вдалося оновити проєкт. Спробуйте ще раз.'
            );
            done();
          },
        });
    });
  });
});
