import { inject, Injectable } from '@angular/core';
import { AttachmentsService } from '../attachments.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { FileMetadataDTO } from '@models/file.model';
import { format } from 'date-fns';
import { NotificationService } from '../notification.service';

interface UploadResult {
  progress: number;
  files: FileMetadataDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class FileHandlerService {
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly notificationService = inject(NotificationService);
  private readonly completeProgress = 100;

  uploadFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<UploadResult> {
    if (!files.length) {
      this.notificationService.showWarning('No files provided for upload');
      return of(this.createEmptyResult());
    }

    if (!this.validateFilesBeforeUpload(files)) {
      const error = new Error('One of more files are invalid');
      this.notificationService.showError('Invalid file(s) detected');
      return throwError(() => error);
    }

    return this.attachmentsService
      .uploadFiles(entityType, entityId, files)
      .pipe(
        map((response) => {
          return this.handleUploadResponse(
            response,
            entityType,
            entityId,
            files
          );
        }),
        catchError((error) => this.handleUploadError(error, files.length))
      );
  }

  deleteFile(file: FileMetadataDTO): Observable<string> {
    if (!file?.fileName) {
      const error = new Error('Invalid file reference');
      this.notificationService.showError('Invalid file');
      return throwError(() => error);
    }

    return this.attachmentsService
      .deleteFile(
        file.entityType.toString().toLowerCase(),
        file.entityId,
        file.fileName
      )
      .pipe(
        catchError((error) => {
          this.notificationService.showError('Failed to delete file');
          console.error('Delete file error:', error);
          return throwError(() => error);
        })
      );
  }

  private validateFilesBeforeUpload(files: File[]): boolean {
    const maxSize = 20 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    return files.every(
      (file) => file.size <= maxSize && allowedTypes.includes(file.type)
    );
  }

  private handleUploadResponse(
    response: string[],
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): UploadResult {
    const uploadedFiles = response
      .map((url, index) =>
        url
          ? this.createFileMetadata(url, entityType, entityId, files[index])
          : null
      )
      .filter((file): file is FileMetadataDTO => file !== null);

    if (uploadedFiles.length !== files.length) {
      console.warn('Some files failed to upload');
    }

    return {
      progress: this.completeProgress,
      files: uploadedFiles,
    };
  }

  private handleUploadError(
    error: any,
    fileCount: number
  ): Observable<UploadResult> {
    const errorMessage = this.getUploadErrorMessage(error, fileCount);
    this.notificationService.showError(errorMessage);
    console.error('File upload error:', error);
    return throwError(() => error);
  }

  private getUploadErrorMessage(error: any, fileCount: number): string {
    if (error.status === 413) {
      return 'File size exceeds maximum limit';
    }
    if (error.status === 415) {
      return 'Unsupported file type';
    }
    if (fileCount > 1) {
      return 'Failed to upload some files';
    }
    return 'Failed to upload file';
  }

  private createFileMetadata(
    url: string,
    entityType: ProjectType,
    entityId: string,
    file: File
  ): FileMetadataDTO {
    return {
      fileUrl: url,
      fileName: file.name,
      entityType,
      entityId,
      uploadedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS'),
      id: '',
      fileSize: file.size,
      checksum: '',
    };
  }

  private createEmptyResult(): UploadResult {
    return {
      progress: this.completeProgress,
      files: [],
    };
  }
}
