import { inject, Injectable } from '@angular/core';
import { AttachmentsService } from './attachments.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { FileMetadataDTO } from '@models/file.model';
import { format } from 'date-fns';
import { ApiResponse } from '@models/api-response.model';

interface UploadResult {
  progress: number;
  files: FileMetadataDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class FileHandlerService {
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly completeProgress = 100;

  uploadFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<UploadResult> {
    if (!files.length) {
      return of(this.createEmptyResult());
    }

    return this.attachmentsService
      .uploadFiles(entityType, entityId, files)
      .pipe(
        map((response) =>
          this.handleUploadResponse(response, entityType, entityId, files)
        ),
        catchError((error) => this.handleUploadError(error))
      );
  }

  deleteFile(file: FileMetadataDTO): Observable<ApiResponse<string>> {
    return this.attachmentsService.deleteFile(
      file.entityType.toString().toLowerCase(),
      file.entityId,
      file.fileName
    );
  }

  private handleUploadResponse(
    response: ApiResponse<string[]>,
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): UploadResult {
    if (!response.success || !response.data.length) {
      return this.createEmptyResult();
    }

    const uploadedFiles = response.data
      .map((url, index) =>
        url
          ? this.createFileMetadata(url, entityType, entityId, files[index])
          : null
      )
      .filter((file): file is FileMetadataDTO => file !== null);
    return {
      progress: this.completeProgress,
      files: uploadedFiles,
    };
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

  private handleUploadError(error: unknown): Observable<UploadResult> {
    console.error('Upload error:', error);
    return of(this.createEmptyResult());
  }

  private createEmptyResult(): UploadResult {
    return {
      progress: this.completeProgress,
      files: [],
    };
  }
}
