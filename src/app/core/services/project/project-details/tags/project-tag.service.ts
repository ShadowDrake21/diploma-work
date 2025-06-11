import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  Subject,
  BehaviorSubject,
  forkJoin,
  of,
  catchError,
  takeUntil,
} from 'rxjs';
import { TagService } from '../../models/tag.service';
import { Tag } from '@models/tag.model';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectTagService implements OnDestroy {
  private readonly tagService = inject(TagService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyed$ = new Subject<void>();

  // State
  private _tags = new BehaviorSubject<any[]>([]);
  tags$ = this._tags.asObservable();

  loadTags(tagIds: string[] | undefined): void {
    if (!tagIds?.length) {
      this._tags.next([]);
      return;
    }

    forkJoin(
      tagIds.map((tagId) =>
        this.tagService.getTagById(tagId).pipe(
          catchError((error) => {
            return of(null);
          })
        )
      )
    )
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (responses) => {
          const validTags = responses.filter((tag): tag is Tag => tag !== null);
          this._tags.next(validTags);

          if (validTags.length !== tagIds.length) {
            this.errorHandler.handleServiceError(
              new Error('Не вдалося завантажити деякі теги'),
              `${tagIds.length - validTags.length} теги не вдалося завантажити`
            );
          }
        },
        error: (error) => {
          this.errorHandler.handleServiceError(
            error,
            'Не вдалося завантажити теги'
          );
          this._tags.next([]);
        },
      });
  }

  resetTags(): void {
    this._tags.next([]);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
