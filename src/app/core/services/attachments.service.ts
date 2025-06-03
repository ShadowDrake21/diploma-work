import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse } from '@models/api-response.model';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { catchError, filter, forkJoin, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttachmentsService {
  private readonly http = inject(HttpClient);
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

    return this.http
      .get<ApiResponse<FileMetadataDTO[]>>(endpoint, getAuthHeaders())
      .pipe(
        map((response) => response.data || []),
        this.handleError<FileMetadataDTO[]>('Error fetching attachments', [])
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
  ): Observable<ApiResponse<string>> {
    const formData = this.createFormData(file, entityType, uuid);
    return this.http
      .post<ApiResponse<string>>(`${this.apiUrl}/upload`, formData, {
        reportProgress: true,
        observe: 'events',
        responseType: 'json',
        ...getAuthHeaders(),
      })
      .pipe(
        filter((event) => event.type === HttpEventType.Response),
        map(
          (event) =>
            (event as HttpResponse<ApiResponse<string>>)
              .body as ApiResponse<string>
        ),
        this.handleError<ApiResponse<string>>(
          'Upload failed',
          this.createErrorResponse('Upload failed')
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
  ): Observable<ApiResponse<string[]>> {
    console.log('Uploading files:', files);
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
  ): Observable<ApiResponse<string[]>> {
    const formData = this.createUpdateFormData(files, entityType, entityId);

    return this.http.post<ApiResponse<string[]>>(
      `${this.apiUrl}/update-files`,
      formData,
      getAuthHeaders()
    );
  }

  deleteFile(
    entityType: string,
    entityId: string,
    fileName: string
  ): Observable<ApiResponse<string>> {
    const endpoint = this.buildEndpoint(
      'delete',
      encodeURIComponent(entityType.toLowerCase()),
      encodeURIComponent(entityId),
      encodeURIComponent(fileName)
    );

    return this.http.delete<ApiResponse<string>>(endpoint, {
      responseType: 'text' as 'json',
      ...getAuthHeaders(),
    });
  }

  // Helper methods
  private uploadSingleFileAsArray(
    file: File,
    entityType: ProjectType,
    entityId: string
  ): Observable<ApiResponse<string[]>> {
    return this.uploadFile(file, entityType, entityId).pipe(
      map((response) => ({
        ...response,
        data: response.data ? [response.data] : [],
      })),
      this.handleError<ApiResponse<string[]>>(
        'Upload failed',
        this.createErrorResponse('Upload failed', [])
      )
    );
  }

  private uploadMultipleFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<ApiResponse<string[]>> {
    const uploadObservables = files.map((file) =>
      this.uploadFile(file, entityType, entityId).pipe(
        map((response) => response.data!),
        catchError(() => of(null))
      )
    );
    return forkJoin(uploadObservables).pipe(
      map((results) => this.createBatchUploadResponse(results, files.length))
    );
  }

  private createBatchUploadResponse(
    results: (string | null)[],
    totalFiles: number
  ): ApiResponse<string[]> {
    const successfulUploads = results.filter((url): url is string => !!url);

    return {
      success: successfulUploads.length > 0,
      message: this.getBatchUploadMessage(successfulUploads.length, totalFiles),
      data: successfulUploads,
      timestamp: new Date(),
    };
  }

  private getBatchUploadMessage(
    successCount: number,
    totalCount: number
  ): string {
    return successCount === totalCount
      ? 'All files uploaded successfully'
      : `Uploaded ${successCount} of ${totalCount} files`;
  }

  private createErrorResponse<T>(
    message: string,
    data: T | null = null
  ): ApiResponse<T> {
    return {
      success: false,
      message,
      data: data as T,
      timestamp: new Date(),
    };
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

  private handleError<T>(message: string, fallbackValue: T) {
    return (source: Observable<T>) =>
      source.pipe(
        catchError((error) => {
          console.error(message, error);
          return of(fallbackValue);
        })
      );
  }
}
