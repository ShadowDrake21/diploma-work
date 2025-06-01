import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  Subject,
  BehaviorSubject,
  forkJoin,
  of,
  catchError,
  take,
  takeUntil,
} from 'rxjs';
import { TagService } from '../../models/tag.service';
import { NotificationService } from '@core/services/notification.service';
import { ApiResponse } from '@models/api-response.model';
import { Tag, TagDTO } from '@models/tag.model';
import { ErrorHandlerService } from '@core/services/utils/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectTagService implements OnDestroy {
  private tagService = inject(TagService);
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ErrorHandlerService);
  private destroyed$ = new Subject<void>();

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
              new Error('Some tags failed to load'),
              `${tagIds.length - validTags.length} tags failed to load`
            );
          }
        },
        error: (error) => {
          this.errorHandler.handleServiceError(error, 'Failed to load tags');
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
