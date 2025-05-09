import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse } from '@models/api-response.model';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { catchError, forkJoin, map, Observable, of, timestamp } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttachmentsService {
  private http = inject(HttpClient);
  private apiUrl = BASE_URL + 's3';

  getFilesByEntity(
    entityType: string,
    entityId: string
  ): Observable<FileMetadataDTO[]> {
    return this.http
      .get<ApiResponse<FileMetadataDTO[]>>(
        `${this.apiUrl}/files/${entityType.toLowerCase()}/${entityId}`,
        getAuthHeaders()
      )
      .pipe(
        map((response) => response.data || []),
        catchError((error) => {
          console.error('Error fetching attachments: ', error);
          return of([]);
        })
      );
  }

  uploadFile(
    file: File,
    entityType: ProjectType,
    uuid: string
  ): Observable<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType.toString());
    formData.append('entityId', uuid.toString());
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/upload`,
      formData,
      {
        responseType: 'text' as 'json',
        ...getAuthHeaders(),
      }
    );
  }

  uploadFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<ApiResponse<string[]>> {
    const uploadObservables = files.map((file) =>
      this.uploadFile(file, entityType, entityId).pipe(
        map((response) => response.data),
        catchError(() => of(null))
      )
    );

    return forkJoin(uploadObservables).pipe(
      map((results) => ({
        success: results.every((r) => r !== null),
        message: results.every((r) => r !== null)
          ? 'All files uploaded successfully'
          : 'Some files failed to upload',
        data: results.filter((r) => r !== null) as string[],
        timestamp: new Date(),
      }))
    );
  }

  updateFiles(
    entityType: ProjectType,
    entityId: string,
    files: (File | FileMetadataDTO)[]
  ): Observable<ApiResponse<string[]>> {
    const formData = new FormData();

    files.forEach((file) => {
      if (file instanceof File) {
        formData.append('files', file, file.name);
      }
    });
    formData.append('entityType', entityType.toString());
    formData.append('entityId', entityId);

    return this.http.post<ApiResponse<string[]>>(
      `${this.apiUrl}/update-files`,
      formData,
      {
        headers: getAuthHeaders().headers,
      }
    );
  }

  addFilesWithoutReplacing(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<ApiResponse<string[]>> {
    if (!files.length) {
      return of({
        success: false,
        message: 'No files to upload',
        data: [],
        timestamp: new Date(),
      });
    }

    // Upload each file individually
    const uploadObservables = files.map((file) =>
      this.uploadFile(file, entityType, entityId).pipe(
        map((response) => response.data),
        catchError(() => of(null))
      )
    );

    return forkJoin(uploadObservables).pipe(
      map((results) => ({
        success: results.every((r) => r !== null),
        message: results.every((r) => r !== null)
          ? 'All files uploaded successfully'
          : 'Some files failed to upload',
        data: results.filter((r) => r !== null) as string[],
        timestamp: new Date(),
      }))
    );
  }

  deleteFile(fileName: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/delete/${fileName}`,
      {
        responseType: 'text' as 'json',
        ...getAuthHeaders(),
      }
    );
  }
}
