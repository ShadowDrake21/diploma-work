import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { getAuthHeaders } from '@core/utils/auth.utils';
import {
  catchError,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AttachmentsService {
  private readonly http = inject(HttpClient);
  private readonly notificationService = inject(NotificationService);
  private readonly apiUrl = BASE_URL + 's3';

  /**
   * Gets files associated with an entity
   * @param entityType - Type of the entity
   * @param entityId - ID of the entity
   * @returns Observable of file metadata array
   */
  getFilesByEntity(
    entityType: ProjectType,
    entityId: string
  ): Observable<FileMetadataDTO[]> {
    const endpoint = this.buildEndpoint(
      'files',
      entityType.toLowerCase(),
      entityId
    );

    return this.http.get<FileMetadataDTO[]>(endpoint, getAuthHeaders()).pipe(
      map((response) => response || []),
      catchError((error) =>
        this.handleError(error, 'Failed to load attachments', [])
      )
    );
  }

  /**
   * Uploads a single file
   * @param file - File to upload
   * @param entityType - Type of the entity
   * @param uuid - Entity ID
   * @returns Observable of upload response
   */
  uploadFile(
    file: File,
    entityType: ProjectType,
    uuid: string
  ): Observable<string> {
    if (!file) {
      return throwError(() => new Error('No file provided for upload'));
    }

    const formData = this.createFormData(file, entityType, uuid);

    return this.http
      .post<string>(`${this.apiUrl}/upload`, formData, {
        reportProgress: true,
        observe: 'events',
        responseType: 'json',
        ...getAuthHeaders(),
      })
      .pipe(
        filter((event) => event.type === HttpEventType.Response),
        map((event) => (event as HttpResponse<string>).body!),
        catchError((error) =>
          this.handleError<string>(
            error,
            `Failed to upload file: ${file.name}`,
            ''
          )
        )
      );
  }

  /**
   * Uploads multiple files
   * @param entityType - Type of the entity
   * @param entityId - Entity ID
   * @param files - Array of files to upload
   * @returns Observable of upload responses
   */
  uploadFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<string[]> {
    if (!files?.length) {
      return this.handleError<string[]>(
        'No files to upload',
        'No files to upload',
        []
      );
    }

    if (files.length === 1) {
      return this.uploadSingleFileAsArray(files[0], entityType, entityId);
    }

    return this.uploadMultipleFiles(entityType, entityId, files);
  }

  /**
   * Updates files for an entity
   * @param entityType - Type of the entity
   * @param entityId - Entity ID
   * @param files - Array of files or file metadata to update
   * @returns Observable of update response
   */
  updateFiles(
    entityType: ProjectType,
    entityId: string,
    files: (File | FileMetadataDTO)[]
  ): Observable<string[]> {
    if (!files?.length) {
      return this.handleError<string[]>(
        'No files to upload',
        'No files to upload',
        []
      );
    }

    const formData = this.createUpdateFormData(files, entityType, entityId);

    return this.http
      .post<string[]>(`${this.apiUrl}/update-files`, formData, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.handleError(error, 'Failed to update files', [])
        )
      );
  }

  deleteFile(
    entityType: string,
    entityId: string,
    fileName: string
  ): Observable<string> {
    const endpoint = this.buildEndpoint(
      'delete',
      encodeURIComponent(entityType.toLowerCase()),
      encodeURIComponent(entityId),
      encodeURIComponent(fileName)
    );

    return this.http
      .delete<string>(endpoint, {
        ...getAuthHeaders(),
      })
      .pipe(
        catchError((error) =>
          this.handleError<string>(
            error,
            `Failed to delete file: ${fileName}`,
            ''
          )
        )
      );
  }

  // Helper methods
  private uploadSingleFileAsArray(
    file: File,
    entityType: ProjectType,
    entityId: string
  ): Observable<string[]> {
    return this.uploadFile(file, entityType, entityId).pipe(
      map((response) => (response ? [response] : [])),
      catchError((error) =>
        this.handleError(error, `Failed to upload file: ${file.name}`, [])
      )
    );
  }

  private uploadMultipleFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<string[]> {
    const uploadObservables = files.map((file) =>
      this.uploadFile(file, entityType, entityId).pipe(
        catchError(() => of(null))
      )
    );
    return forkJoin(uploadObservables).pipe(
      map((results) => {
        const successfulUploads = results.filter((url): url is string => !!url);
        return successfulUploads;
      }),
      catchError((error) =>
        this.handleError(error, 'Failed to upload multiple files', [])
      )
    );
  }

  private createFormData(
    file: File,
    entityType: ProjectType,
    entityId: string
  ): FormData {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType.toString());
    formData.append('entityId', entityId.toString());
    return formData;
  }

  private createUpdateFormData(
    files: (File | FileMetadataDTO)[],
    entityType: ProjectType,
    entityId: string
  ): FormData {
    const formData = new FormData();

    files.forEach((file) => {
      if (file instanceof File) {
        formData.append('files', file, file.name);
      }
    });
    formData.append('entityType', entityType.toString());
    formData.append('entityId', entityId);
    return formData;
  }

  private buildEndpoint(...pathSegments: string[]): string {
    return `${this.apiUrl}/${pathSegments.join('/')}`;
  }

  private handleError<T>(
    error: any,
    userMessage: string,
    fallback: T
  ): Observable<T> {
    console.error(userMessage, error);
    this.notificationService.showError(userMessage);
    return of(fallback);
  }
}
