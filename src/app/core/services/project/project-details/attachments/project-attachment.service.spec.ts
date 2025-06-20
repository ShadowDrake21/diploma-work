import { TestBed } from '@angular/core/testing';

import { ProjectAttachmentService } from './project-attachment.service';
import { AttachmentsService } from '@core/services/attachments.service';
import { NotificationService } from '@core/services/notification.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { of, throwError } from 'rxjs';

describe('ProjectAttachmentService', () => {
  let service: ProjectAttachmentService;
  let attachmentsServiceMock: jasmine.SpyObj<AttachmentsService>;
  let notificationServiceMock: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    attachmentsServiceMock = jasmine.createSpyObj('AttachmentsService', [
      'getFilesByEntity',
    ]);
    notificationServiceMock = jasmine.createSpyObj('NotificationService', [
      'showError',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ProjectAttachmentService,
        { provide: AttachmentsService, useValue: attachmentsServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });

    service = TestBed.inject(ProjectAttachmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadAttachments', () => {
    it('should load attachments and update state', () => {
      const mockAttachments = [{ id: '1', name: 'file.pdf' }];
      attachmentsServiceMock.getFilesByEntity.and.returnValue(
        of(mockAttachments)
      );

      service.loadAttachments(ProjectType.PUBLICATION, 'project123');

      expect(attachmentsServiceMock.getFilesByEntity).toHaveBeenCalledWith(
        ProjectType.PUBLICATION,
        'project123'
      );
      service.attachments$.subscribe((attachments) => {
        expect(attachments).toEqual(mockAttachments);
      });
      service.loading$.subscribe((loading) => {
        expect(loading).toBeFalse();
      });
    });

    it('should handle empty project type', () => {
      service.loadAttachments(undefined, 'project123');

      service.attachments$.subscribe((attachments) => {
        expect(attachments).toEqual([]);
      });
      expect(attachmentsServiceMock.getFilesByEntity).not.toHaveBeenCalled();
    });

    it('should handle error and show notification', () => {
      const error = new Error('Failed to load');
      attachmentsServiceMock.getFilesByEntity.and.returnValue(
        throwError(() => error)
      );

      service.loadAttachments(ProjectType.PUBLICATION, 'project123');

      expect(notificationServiceMock.showError).toHaveBeenCalledWith(
        'Не вдалося завантажити вкладені файли.'
      );
      service.loading$.subscribe((loading) => {
        expect(loading).toBeFalse();
      });
    });
  });

  describe('resetAttachments', () => {
    it('should reset attachments to empty array', () => {
      service['_attachments'].next([{ id: '1', name: 'file.pdf' }]);

      service.resetAttachments();

      service.attachments$.subscribe((attachments) => {
        expect(attachments).toEqual([]);
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroyed$ subject', () => {
      const nextSpy = spyOn(service['destroyed$'], 'next');
      const completeSpy = spyOn(service['destroyed$'], 'complete');

      service.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
