import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse } from '@models/api-response.model';
import {
  Tag,
  TagApiResponse,
  TagDTO,
  TagListApiResponse,
} from '@models/tag.model';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private http = inject(HttpClient);
  private apiUrl = BASE_URL + 'tags';

  getAllTags(): Observable<Tag[]> {
    return this.http
      .get<TagListApiResponse>(`${this.apiUrl}`, getAuthHeaders())
      .pipe(map((response) => response.data));
  }

  getTagById(id: string): Observable<Tag> {
    return this.http
      .get<TagApiResponse>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(map((response) => response.data));
  }

  createTag(tag: TagDTO): Observable<Tag> {
    return this.http
      .post<TagApiResponse>(`${this.apiUrl}`, tag, getAuthHeaders())
      .pipe(map((response) => response.data));
  }

  updateTag(id: string, tag: any): Observable<Tag> {
    return this.http
      .put<TagApiResponse>(`${this.apiUrl}/${id}`, tag, getAuthHeaders())
      .pipe(map((response) => response.data));
  }

  deleteTag(id: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(map(() => undefined));
  }
}
