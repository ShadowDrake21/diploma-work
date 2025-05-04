import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ProjectType } from '@shared/enums/categories.enum';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttachmentsService {
  private http = inject(HttpClient);
  private apiUrl = BASE_URL + 's3';

  getFilesByEntity(entityType: string, entityId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/files/${entityType.toLowerCase()}/${entityId}`,
      getAuthHeaders()
    );
  }

  uploadFile(
    file: File,
    entityType: ProjectType,
    uuid: string
  ): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType.toString());
    formData.append('entityId', uuid.toString());
    return this.http.post<string>(`${this.apiUrl}/upload`, formData, {
      responseType: 'text' as 'json',
      ...getAuthHeaders(),
    });
  }

  uploadFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<string[]> {
    const uploadObservables = files.map((file) =>
      this.uploadFile(file, entityType, entityId)
    );

    return forkJoin(uploadObservables);
  }

  updateFiles(
    entityType: ProjectType,
    entityId: string,
    files: File[]
  ): Observable<string> {
    console.log('updateFiles', files, entityId, entityType);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('entityType', entityType.toString());
    formData.append('entityId', entityId);

    return this.http.post<string>(`${this.apiUrl}/update-files`, formData, {
      responseType: 'text' as 'json',
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }

  deleteFile(fileName: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${fileName}`, {
      responseType: 'text' as 'json',
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      }),
    });
  }
}
