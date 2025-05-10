import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse } from '@models/api-response.model';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectType } from '@shared/enums/categories.enum';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { catchError, filter, forkJoin, map, Observable, of } from 'rxjs';

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
        catchError((error) => {
          console.error('Upload error: ', error);
          return of({
            success: false,
            message: 'Upload failed',
            data: '',
            timestamp: new Date(),
          });
        })
      );
  }

  uploadFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<ApiResponse<string[]>> {
    if (files.length === 1) {
      return this.uploadFile(files[0], entityType, entityId).pipe(
        map((response) => ({
          ...response,
          data: response.data ? [response.data] : [],
        })),
        catchError((error) =>
          of({
            success: false,
            message: 'Upload failed',
            data: [],
            timestamp: new Date(),
          })
        )
      );
    }
    const uploadObservables = files.map((file) =>
      this.uploadFile(file, entityType, entityId).pipe(
        map((response) => response.data),
        catchError(() => of(null))
      )
    );

    return forkJoin(uploadObservables).pipe(
      map((results) => {
        const successfulUploads = results.filter((url) => !!url) as string[];
        return {
          success: successfulUploads.length > 0,
          message:
            successfulUploads.length === files.length
              ? 'All files uploaded successfully'
              : `Uploaded ${successfulUploads.length} of ${files.length} files`,
          data: successfulUploads,
          timestamp: new Date(),
        };
      })
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

  deleteFile(
    entityType: string,
    entityId: string,
    fileName: string
  ): Observable<ApiResponse<string>> {
    // Encode each part of the URL separately
    const encodedType = encodeURIComponent(entityType.toLowerCase());
    const encodedId = encodeURIComponent(entityId);
    const encodedFile = encodeURIComponent(fileName);

    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/delete/${encodedType}/${encodedId}/${encodedFile}`,
      {
        responseType: 'text' as 'json',
        ...getAuthHeaders(),
      }
    );
  }
}
