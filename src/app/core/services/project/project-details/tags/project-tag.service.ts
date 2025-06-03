import { inject, Injectable } from '@angular/core';
import { Subject, BehaviorSubject, forkJoin, of, catchError } from 'rxjs';
import { TagService } from '../../models/tag.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectTagService {
  private tagService = inject(TagService);
  private destroyed$ = new Subject<void>();

  // State
  private _tags = new BehaviorSubject<any[]>([]);
  tags$ = this._tags.asObservable();

  loadTags(tagIds: string[] | undefined): void {
    const tags$ = tagIds?.length
      ? forkJoin(tagIds.map((tagId) => this.tagService.getTagById(tagId)))
      : of([]);

    tags$
      .pipe(
        catchError((err) => {
          console.error('Error loading tags:', err);
          return of([]);
        })
      )
      .subscribe((tags) => this._tags.next(tags));
  }

  resetTags(): void {
    this._tags.next([]);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
