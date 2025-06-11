import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { Tag, TagDTO } from '@models/tag.model';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { catchError, map, Observable } from 'rxjs';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly apiUrl = BASE_URL + 'tags';

  getAllTags(): Observable<Tag[]> {
    return this.http
      .get<Tag[]>(`${this.apiUrl}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(error, `Failed to load tags`)
        )
      );
  }

  getTagById(id: string): Observable<Tag> {
    return this.http
      .get<Tag>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to load tag with ID ${id}`
          )
        )
      );
  }

  createTag(tag: TagDTO): Observable<Tag> {
    return this.http
      .post<Tag>(`${this.apiUrl}`, tag, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(error, `Failed to create tag`)
        )
      );
  }

  updateTag(id: string, tag: any): Observable<Tag> {
    return this.http
      .put<Tag>(`${this.apiUrl}/${id}`, tag, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to update tag with ID ${id}`
          )
        )
      );
  }

  deleteTag(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, getAuthHeaders())
      .pipe(
        catchError((error) =>
          this.errorHandler.handleServiceError(
            error,
            `Failed to delete tag with ID ${id}`
          )
        )
      );
  }
}
