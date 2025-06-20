import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FileHandlerFacadeService } from './file-handler-facade.service';
import { FileHandlerService } from './file-handler.service';
import { NotificationService } from '../notification.service';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { of, throwError } from 'rxjs';

describe('FileHandlerFacadeService', () => {
  let service: FileHandlerFacadeService;
  let fileHandlerMock: jasmine.SpyObj<FileHandlerService>;
  let notificationMock: jasmine.SpyObj<NotificationService>;

  const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
  const mockMetadata: FileMetadataDTO = {
    fileUrl: 'http://example.com/test.txt',
    fileName: 'test.txt',
    entityType: ProjectType.PUBLICATION,
    entityId: '123',
    uploadedAt: '2023-01-01',
    id: '1',
    fileSize: 1234,
    checksum: 'abc123',
  };

  beforeEach(() => {
    fileHandlerMock = jasmine.createSpyObj('FileHandlerService', [
      'uploadFile',
      'deleteFile',
    ]);

    notificationMock = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
      'showWarning',
    ]);

    TestBed.configureTestingModule({
      providers: [
        FileHandlerFacadeService,
        { provide: FileHandlerService, useValue: fileHandlerMock },
        { provide: NotificationService, useValue: notificationMock },
      ],
    });

    service = TestBed.inject(FileHandlerFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should initialize with default values', () => {
      service.initialize();
      expect(service.uploadedFiles()).toEqual([]);
      expect(service.pendingFiles()).toEqual([]);
      expect(service.uploadProgress()).toBe(0);
      expect(service.isUploading()).toBeFalse();
      expect(service.errorState()).toBeNull();
    });

    it('should initialize with existing files', () => {
      service.initialize([mockMetadata]);
      expect(service.uploadedFiles()).toEqual([mockMetadata]);
    });
  });

  describe('onFilesSelected', () => {
    it('should add unique files to pending list', () => {
      service.onFilesSelected([mockFile]);
      expect(service.pendingFiles()).toEqual([mockFile]);
    });

    it('should filter duplicate files', () => {
      service.uploadedFiles.set([mockMetadata]);
      service.onFilesSelected([mockFile]);
      expect(service.pendingFiles()).toEqual([]);
    });

    it('should handle erorrs', () => {
      spyOn(service as any, 'filterDuplicateFiles').and.throwError(
        'Test error'
      );
      service.onFilesSelected([mockFile]);
      expect(notificationMock.showError).toHaveBeenCalled();
      expect(service.errorState()).toBeTruthy();
    });
  });

  describe('uploadFiles', () => {
    it('should return empty result when no files to upload', fakeAsync(() => {
      fileHandlerMock.uploadFiles.and.returnValue(
        of({
          progress: 100,
          files: [],
        })
      );

      service
        .uploadFiles(ProjectType.PUBLICATION, '123')
        .subscribe((result) => {
          expect(result.files).toEqual([]);
        });
      tick();

      expect(notificationMock.showWarning).toHaveBeenCalled();
    }));

    it('should handle missing parameters', fakeAsync(() => {
      service.pendingFiles.set([mockFile]);

      service.uploadFiles('' as ProjectType, '').subscribe({
        error: (err) => {
          expect(err).toBeDefined();
        },
      });
      tick();
      expect(notificationMock.showError).toHaveBeenCalled();
    }));

    it('should update progress during upload', fakeAsync(() => {
      service.pendingFiles.set([mockFile]);
      fileHandlerMock.uploadFiles.and.returnValue(
        of(
          {
            progress: 50,
            files: [],
          },
          {
            progress: 100,
            files: [mockMetadata],
          }
        )
      );
      service.uploadFiles(ProjectType.PUBLICATION, '123').subscribe();
      tick();
      expect(service.uploadProgress()).toBe(100);
      expect(service.isUploading()).toBeFalse();
    }));

    it('should handle upload errors', fakeAsync(() => {
      service.pendingFiles.set([mockFile]);
      fileHandlerMock.uploadFiles.and.returnValue(
        throwError(() => new Error('Upload failed'))
      );

      service.uploadFiles(ProjectType.PUBLICATION, '123').subscribe({
        error: (err) => {
          expect(service.errorState()).toBeTruthy();
        },
      });
      tick();

      expect(notificationMock.showError).toHaveBeenCalled();
    }));
  });

  describe('handleUploadSuccess', () => {
    it('should update files lists on success', () => {
      service.pendingFiles.set([mockFile]);
      service.handleUploadSuccess([mockMetadata]);

      expect(service.pendingFiles()).toEqual([]);
      expect(service.uploadedFiles()).toEqual([mockMetadata]);
      expect(notificationMock.showSuccess).toHaveBeenCalled();
    });

    it('should handle empty response', () => {
      service.pendingFiles.set([mockFile]);
      service.handleUploadSuccess([]);

      expect(service.pendingFiles()).toEqual([mockFile]);
    });
  });

  describe('removeFile', () => {
    it('should remove pending file', () => {
      service.pendingFiles.set([mockFile]);
      service.removeFile(0, true).subscribe(() => {
        expect(service.pendingFiles()).toEqual([]);
      });
      tick();
    });

    it('should delete uploaded file', fakeAsync(() => {
      service.uploadedFiles.set([mockMetadata]);
      fileHandlerMock.deleteFile.and.returnValue(of('success'));

      service.removeFile(0, false).subscribe(() => {
        expect(service.uploadedFiles()).toEqual([]);
      });
      tick();

      expect(notificationMock.showSuccess).toHaveBeenCalled();
    }));

    it('should handle delete errors', fakeAsync(() => {
      service.uploadedFiles.set([mockMetadata]);
      fileHandlerMock.deleteFile.and.returnValue(
        throwError(() => new Error('Delete failed'))
      );

      service.removeFile(0, false).subscribe({
        error: () => {
          expect(notificationMock.showError).toHaveBeenCalled();
        },
      });
      tick();
    }));
  });

  describe('getFiles', () => {
    it('should return current files state', () => {
      service.uploadedFiles.set([mockMetadata]);
      service.pendingFiles.set([mockFile]);

      const result = service.getFiles();
      expect(result.uploaded).toEqual([mockMetadata]);
      expect(result.pending).toEqual([mockFile]);
    });
  });
});
