import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AttachmentsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/s3';

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.apiUrl}/upload`, formData, {
      responseType: 'text' as 'json',
    });
  }

  deleteFile(fileName: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${fileName}`, {
      responseType: 'text' as 'json',
    });
  }
}
