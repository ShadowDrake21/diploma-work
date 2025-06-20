import { TestBed } from '@angular/core/testing';

import { FileHandlerService } from './file-handler.service';
import { AttachmentsService } from '../attachments.service';
import { NotificationService } from '../notification.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { of, throwError } from 'rxjs';
import { FileMetadataDTO } from '@models/file.model';

describe('FileHandlerService', () => {
  let service: FileHandlerService;
  let attachmentsMock: jasmine.SpyObj<AttachmentsService>;
  let notificationMock: jasmine.SpyObj<NotificationService>;

  const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
  const mockFile2 = new File(['content'], 'test2.txt', { type: 'text/plain' });

  beforeEach(() => {
    attachmentsMock = jasmine.createSpyObj('AttachmentsService', [
      'uploadFiles',
      'deleteFile',
    ]);
    notificationMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
      'showWarning',
    ]);

    TestBed.configureTestingModule({
      providers: [
        FileHandlerService,
        { provide: AttachmentsService, useValue: attachmentsMock },
        { provide: NotificationService, useValue: notificationMock },
      ],
    });

    service = TestBed.inject(FileHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadFile', () => {
    it('should return warning when no files provided', () => {
      const result = service.uploadFiles(ProjectType.PUBLICATION, '123', []);
      expect(notificationMock.showWarning).toHaveBeenCalled();
    });

    it('should validate files before upload', () => {
      const largeFile = new File(
        [new ArrayBuffer(21 * 1024 * 1024)],
        'large.jpg'
      );
      const result = service.uploadFiles(ProjectType.PUBLICATION, '123', [
        largeFile,
      ]);
      expect(notificationMock.showError).toHaveBeenCalled();
    });

    it('should handle successful upload', () => {
      attachmentsMock.uploadFiles.and.returnValue(of(['url1']));
      const result = service.uploadFiles(ProjectType.PUBLICATION, '123', [
        mockFile,
      ]);

      result.subscribe((res) => {
        expect(res.files.length).toBe(1);
        expect(res.progress).toBe(100);
      });
    });

    it('should handle partial upload success', () => {
      attachmentsMock.uploadFiles.and.returnValue(of(['url1', null]));
      const result = service.uploadFiles(ProjectType.PUBLICATION, '123', [
        mockFile,
        mockFile2,
      ]);

      result.subscribe((res) => {
        expect(res.files.length).toBe(1);
      });
    });

    it('should handle upload error', () => {
      attachmentsMock.uploadFiles.and.returnValue(
        throwError(() => ({ status: 413 }))
      );
      const result = service.uploadFiles(ProjectType.PUBLICATION, '123', [
        mockFile,
      ]);

      result.subscribe({
        error: () => {
          expect(notificationMock.showError).toHaveBeenCalledWith(
            'Розмір файлу перевищує максимальний ліміт'
          );
        },
      });
    });
  });

  describe('deleteFile', () => {
    it('should validate file before deletion', () => {
      const result = service.deleteFile({} as any);
      expect(notificationMock.showError).toHaveBeenCalled();
    });

    it('should handle successful deletion', () => {
      attachmentsMock.deleteFile.and.returnValue(of('success'));
      const file: FileMetadataDTO = {
        fileName: 'test.txt',
        entityType: ProjectType.PUBLICATION,
        entityId: '123',
        fileUrl: '',
        uploadedAt: '',
        id: '',
        fileSize: 0,
        checksum: '',
      };

      service.deleteFile(file).subscribe(() => {
        expect(attachmentsMock.deleteFile).toHaveBeenCalled();
      });
    });

    it('should handle deletion errors', () => {
      attachmentsMock.deleteFile.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );
      const file: FileMetadataDTO = {
        fileName: 'test.txt',
        entityType: ProjectType.PUBLICATION,
        entityId: '123',
        fileUrl: '',
        uploadedAt: '',
        id: '',
        fileSize: 0,
        checksum: '',
      };

      service.deleteFile(file).subscribe({
        error: () => {
          expect(notificationMock.showError).toHaveBeenCalled();
        },
      });
    });
  });

  describe('validation', () => {
    it('should validate file types', () => {
      const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const invalidFile = new File([''], 'test.exe', {
        type: 'application/exe',
      });

      expect(
        (service as any).validateFilesBeforeUpload([validFile])
      ).toBeTrue();
      expect(
        (service as any).validateFilesBeforeUpload([invalidFile])
      ).toBeFalse();
    });

    it('should validate file size', () => {
      const validFile = new File(
        [new ArrayBuffer(10 * 1024 * 1024)],
        'test.jpg'
      );
      const invalidFile = new File(
        [new ArrayBuffer(21 * 1024 * 1024)],
        'large.jpg'
      );

      expect(
        (service as any).validateFilesBeforeUpload([validFile])
      ).toBeTrue();
      expect(
        (service as any).validateFilesBeforeUpload([invalidFile])
      ).toBeFalse();
    });
  });
});
